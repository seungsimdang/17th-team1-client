'use client';

import { useState, useCallback } from 'react';
import exifr from 'exifr';

interface ImageMetadata {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  imagePreview: string;
  dimensions?: {
    width: number;
    height: number;
  };
  camera?: {
    make: string;
    model: string;
    software: string;
  };
  settings?: {
    iso: number;
    aperture: number;
    shutterSpeed: string;
    focalLength: number;
    flash: boolean;
  };
  location?: {
    latitude: number;
    longitude: number;
    altitude?: number;
    address?: string;
    nearbyPlaces?: string[];
  };
  timestamp?: string;
  orientation?: number;
  status: 'processing' | 'completed' | 'error';
  error?: string;
}

export default function ImageMetadataPage() {
  const [metadataList, setMetadataList] = useState<ImageMetadata[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedImage, setSelectedImage] = useState<ImageMetadata | null>(null);
  const [keyword, setKeyword] = useState('');

  const processSingleFile = useCallback(async (file: File): Promise<ImageMetadata> => {
    const id = Math.random().toString(36).substr(2, 9);
    
    const extractedMetadata: ImageMetadata = {
      id,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      imagePreview: URL.createObjectURL(file),
      status: 'processing'
    };

    try {
      const exifData = await exifr.parse(file);

      if (exifData.ImageWidth && exifData.ImageHeight) {
        extractedMetadata.dimensions = {
          width: exifData.ImageWidth,
          height: exifData.ImageHeight
        };
      }

      if (exifData.Make || exifData.Model || exifData.Software) {
        extractedMetadata.camera = {
          make: exifData.Make || '',
          model: exifData.Model || '',
          software: exifData.Software || ''
        };
      }

      if (exifData.ISO || exifData.FNumber || exifData.ExposureTime || exifData.FocalLength || exifData.Flash) {
        extractedMetadata.settings = {
          iso: exifData.ISO || 0,
          aperture: exifData.FNumber || 0,
          shutterSpeed: exifData.ExposureTime ? `1/${Math.round(1/exifData.ExposureTime)}s` : '',
          focalLength: exifData.FocalLength || 0,
          flash: exifData.Flash ? exifData.Flash !== 0 : false
        };
      }

      if (exifData.latitude && exifData.longitude) {
        const nearbyPlaces = await getNearbyPlaces(exifData.latitude, exifData.longitude);
        
        const addressResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${exifData.latitude},${exifData.longitude}&key=AIzaSyDyXVd5kcVivWGlDw4vZWIaN7ROOSkOujg&language=ko`
        );
        
        let actualAddress = `${exifData.latitude.toFixed(4)}, ${exifData.longitude.toFixed(4)}`;
        
        try {
          const addressData = await addressResponse.json();
          if (addressData.results && addressData.results.length > 0) {
            actualAddress = addressData.results[0].formatted_address;
          }
        } catch (error) {
          console.error('주소 검색 실패:', error);
        }
        
        extractedMetadata.location = {
          latitude: exifData.latitude,
          longitude: exifData.longitude,
          altitude: exifData.altitude,
          address: actualAddress,
          nearbyPlaces: [actualAddress, ...nearbyPlaces],
        };
      }

      if (exifData.DateTimeOriginal) {
        const date = new Date(exifData.DateTimeOriginal);
        extractedMetadata.timestamp = date.toLocaleString('ko-KR', {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: true
        });
      }

      if (exifData.Orientation) {
        extractedMetadata.orientation = exifData.Orientation;
      }

      extractedMetadata.status = 'completed';
      return extractedMetadata;

    } catch (error) {
      console.error('메타데이터 추출 실패:', error);
      extractedMetadata.status = 'error';
      extractedMetadata.error = error instanceof Error ? error.message : '알 수 없는 오류';
      return extractedMetadata;
    }
  }, []);

  const getNearbyPlaces = async (lat: number, lng: number): Promise<string[]> => {
    try {
      const response = await fetch(`/api/places?lat=${lat}&lng=${lng}`);
      const data = await response.json();
      return data.places || [];
    } catch (error) {
      console.error('주변 장소 검색 실패:', error);
      return [];
    }
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    const newMetadataList: ImageMetadata[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.type.startsWith('image/')) {
        const metadata = await processSingleFile(file);
        newMetadataList.push(metadata);
        setMetadataList(prev => [...prev, metadata]);
      }
    }

    setIsProcessing(false);
  }, [processSingleFile]);

  const handleImageSelect = (metadata: ImageMetadata) => {
    setSelectedImage(metadata);
  };

  const handleSave = () => {
    if (selectedImage) {
      console.log('저장:', selectedImage, keyword);
      // 저장 로직 구현
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 첫 화면 (이미지 선택)
  if (metadataList.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Status Bar */}
        <div className="flex justify-between items-center px-6 py-4">
          <div className="text-white text-sm">9:41</div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-2 bg-white rounded-sm"></div>
            <div className="w-4 h-2 bg-white rounded-sm"></div>
            <div className="w-6 h-3 border border-white rounded-sm">
              <div className="w-full h-full bg-white rounded-sm"></div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-6">
            <button className="text-white text-2xl">×</button>
            <div className="text-right">
              <div className="text-pink-400 text-lg font-medium">이미지 메타데이터</div>
              <div className="text-white text-sm">사진의 정보를 확인해보세요</div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="px-6 mb-6">
          <div className="bg-gray-800 rounded-2xl p-8 text-center border-2 border-dashed border-gray-600 min-h-[400px] flex flex-col justify-center relative">
            {/* Default Image */}
            <div className="mb-6">
              <div className="w-20 h-20 bg-gray-700 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-white text-base mb-2">꼭 기억하고 싶은 한장면을 선택해주세요.</p>
              <p className="text-gray-400 text-sm">여러 장을 한번에 선택할 수 있습니다</p>
            </div>
            
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-block bg-blue-600 text-white px-8 py-4 rounded-full text-base font-medium cursor-pointer hover:bg-blue-700 transition-colors"
            >
              사진 선택하기
            </label>

            {/* Emoji Button - positioned at bottom right of the main area */}
            <div className="absolute bottom-4 right-4">
              <button className="w-12 h-12 bg-gray-700 bg-opacity-80 rounded-full flex items-center justify-center">
                <span className="text-xl">😊</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6">
          <div className="bg-gray-800 rounded-xl p-4 mb-4">
            <input
              type="text"
              placeholder="+ 10자 이내의 키워드를 추가해보세요."
              className="w-full bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
              maxLength={10}
            />
          </div>
          
          <button className="w-full bg-gray-700 text-white py-4 rounded-xl text-base font-medium">
            저장하기
          </button>
        </div>

        {/* Bottom Spacing */}
        <div className="h-20"></div>
      </div>
    );
  }

  // 이미지 선택 화면
  if (metadataList.length > 0 && !selectedImage) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Status Bar */}
        <div className="flex justify-between items-center px-6 py-4">
          <div className="text-white text-sm">9:41</div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-2 bg-white rounded-sm"></div>
            <div className="w-4 h-2 bg-white rounded-sm"></div>
            <div className="w-6 h-3 border border-white rounded-sm">
              <div className="w-full h-full bg-white rounded-sm"></div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-6">
            <button className="text-white text-2xl">×</button>
            <div className="text-right">
              <div className="text-pink-400 text-lg font-medium">이미지 메타데이터</div>
              <div className="text-white text-sm">사진의 정보를 확인해보세요</div>
            </div>
          </div>
        </div>

        {/* Image Grid */}
        <div className="px-6 mb-6">
          <div className="grid grid-cols-3 gap-3">
            {metadataList.map((metadata) => (
              <div
                key={metadata.id}
                onClick={() => handleImageSelect(metadata)}
                className="aspect-square bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors relative"
              >
                <img
                  src={metadata.imagePreview}
                  alt={metadata.fileName}
                  className="w-full h-full object-cover"
                />
                {metadata.status === 'completed' && (
                  <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6">
          <div className="bg-gray-800 rounded-xl p-4 mb-4">
            <input
              type="text"
              placeholder="+ 10자 이내의 키워드를 추가해보세요."
              className="w-full bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
              maxLength={10}
            />
          </div>
          
          <button className="w-full bg-gray-700 text-white py-4 rounded-xl text-base font-medium">
            저장하기
          </button>
        </div>

        {/* Bottom Spacing */}
        <div className="h-20"></div>
      </div>
    );
  }

  // 선택된 이미지 상세 화면
  if (selectedImage) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Status Bar */}
        <div className="flex justify-between items-center px-6 py-4">
          <div className="text-white text-sm">9:41</div>
          <div className="flex items-center space-x-1">
            <div className="w-4 h-2 bg-white rounded-sm"></div>
            <div className="w-4 h-2 bg-white rounded-sm"></div>
            <div className="w-6 h-3 border border-white rounded-sm">
              <div className="w-full h-full bg-white rounded-sm"></div>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="px-6 pb-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setSelectedImage(null)} className="text-white text-2xl">×</button>
            <div className="text-right">
              <div className="text-pink-400 text-lg font-medium">이미지 메타데이터</div>
              <div className="text-white text-sm">사진의 정보를 확인해보세요</div>
            </div>
          </div>
        </div>

        {/* Selected Image */}
        <div className="px-6 mb-6">
          <div className="bg-white rounded-2xl overflow-hidden">
            <div className="relative">
              <img
                src={selectedImage.imagePreview}
                alt={selectedImage.fileName}
                className="w-full h-64 object-cover"
              />
              
              {/* Date Tag */}
              {selectedImage.timestamp && (
                <div className="absolute top-4 left-4">
                  <div className="bg-gray-800 bg-opacity-80 text-white px-3 py-1 rounded-full text-xs flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {selectedImage.timestamp.split(' ')[0]}
                  </div>
                </div>
              )}

              {/* Location Tag */}
              {selectedImage.location && (
                <div className="absolute top-4 right-4">
                  <div className="bg-gray-800 bg-opacity-80 text-white px-3 py-1 rounded-full text-xs flex items-center">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {selectedImage.location.address}
                  </div>
                </div>
              )}

              {/* Emoji Button */}
              <div className="absolute bottom-4 right-4">
                <button className="w-10 h-10 bg-gray-800 bg-opacity-80 rounded-full flex items-center justify-center">
                  <span className="text-lg">😊</span>
                </button>
              </div>
            </div>

            {/* Metadata Content */}
            <div className="p-6 text-black">
              <h3 className="font-semibold text-lg mb-4">{selectedImage.fileName}</h3>
              
              {selectedImage.status === 'completed' && (
                <div className="space-y-4">
                  {/* Basic Info */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2">기본 정보</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="font-medium">파일명:</span> {selectedImage.fileName}</p>
                      <p><span className="font-medium">파일 크기:</span> {formatFileSize(selectedImage.fileSize)}</p>
                      <p><span className="font-medium">파일 타입:</span> {selectedImage.fileType}</p>
                    </div>
                  </div>

                  {/* Camera Info */}
                  {selectedImage.camera && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">카메라 정보</h4>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">제조사:</span> {selectedImage.camera.make}</p>
                        <p><span className="font-medium">모델:</span> {selectedImage.camera.model}</p>
                        <p><span className="font-medium">소프트웨어:</span> {selectedImage.camera.software}</p>
                      </div>
                    </div>
                  )}

                  {/* Settings */}
                  {selectedImage.settings && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">촬영 설정</h4>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">ISO:</span> {selectedImage.settings.iso}</p>
                        <p><span className="font-medium">조리개:</span> f/{selectedImage.settings.aperture}</p>
                        <p><span className="font-medium">셔터 속도:</span> {selectedImage.settings.shutterSpeed}</p>
                        <p><span className="font-medium">초점 거리:</span> {selectedImage.settings.focalLength}mm</p>
                        <p><span className="font-medium">플래시:</span> {selectedImage.settings.flash ? '사용' : '미사용'}</p>
                      </div>
                    </div>
                  )}

                  {/* Location */}
                  {selectedImage.location && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">위치 정보</h4>
                      <div className="text-sm space-y-1">
                        <p><span className="font-medium">주소:</span> {selectedImage.location.address}</p>
                        <p><span className="font-medium">위도:</span> {selectedImage.location.latitude}</p>
                        <p><span className="font-medium">경도:</span> {selectedImage.location.longitude}</p>
                        {selectedImage.location.altitude && (
                          <p><span className="font-medium">고도:</span> {selectedImage.location.altitude}m</p>
                        )}
                        {selectedImage.location.nearbyPlaces && selectedImage.location.nearbyPlaces.length > 0 && (
                          <div className="mt-2">
                            <p className="font-medium text-blue-700">주변 장소:</p>
                            <ul className="list-disc list-inside ml-2 space-y-1">
                              {selectedImage.location.nearbyPlaces.map((place, index) => (
                                <li key={index} className="text-sm">
                                  {index === 0 ? (
                                    <span className="font-medium text-gray-600">📍 {place}</span>
                                  ) : (
                                    <span className="text-gray-700">• {place}</span>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                        <a
                          href={`https://www.google.com/maps?q=${selectedImage.location.latitude},${selectedImage.location.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block mt-2 px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
                        >
                          Google Maps에서 보기
                        </a>
                      </div>
                    </div>
                  )}

                  {/* Timestamp */}
                  {selectedImage.timestamp && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">촬영 시간</h4>
                      <div className="text-sm">
                        <p><span className="font-medium">날짜/시간:</span> {selectedImage.timestamp}</p>
                      </div>
                    </div>
                  )}

                  {/* Orientation */}
                  {selectedImage.orientation && (
                    <div>
                      <h4 className="font-medium text-gray-800 mb-2">이미지 방향</h4>
                      <div className="text-sm">
                        <p><span className="font-medium">회전:</span> {selectedImage.orientation === 1 ? 'Normal' : selectedImage.orientation === 3 ? 'Rotate 180' : selectedImage.orientation === 6 ? 'Rotate 90 CW' : 'Rotate 90 CCW'}도 회전</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedImage.status === 'error' && (
                <div className="text-red-600 text-sm">
                  <p>오류: {selectedImage.error}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6">
          <div className="bg-gray-800 rounded-xl p-4 mb-4">
            <input
              type="text"
              placeholder="+ 10자 이내의 키워드를 추가해보세요."
              className="w-full bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
              maxLength={10}
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          
          <button 
            onClick={handleSave}
            className="w-full bg-gray-700 text-white py-4 rounded-xl text-base font-medium"
          >
            저장하기
          </button>
        </div>

        {/* Bottom Spacing */}
        <div className="h-20"></div>
      </div>
    );
  }

  return null;
}
