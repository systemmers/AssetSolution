/**
 * 자산 상세 페이지 JavaScript 기능 (호환성 유지용)
 * 
 * 이 파일은 기존 코드와의 호환성을 위해 유지됩니다.
 * 모든 기능은 /detail 디렉토리의 모듈들로 분리되었습니다.
 * 
 * 새로운 코드에서는 다음과 같이 직접 import하세요:
 * import AssetDetail from '../assets/detail/index.js';
 * 
 * 또는 특정 모듈만 가져오기:
 * import { initAssetValueCalculation } from '../assets/detail/AssetValueCalculator.js';
 * import { initQrCodePrint } from '../assets/detail/AssetPrint.js';
 * import { initFileDeleteHandlers } from '../assets/detail/AssetFileManager.js';
 * import { initMaintenanceTable } from '../assets/detail/AssetMaintenanceManager.js';
 */

import AssetDetail from './detail/index.js';

// 이전 코드와의 호환성을 위해 동일한 API 제공
export default AssetDetail;