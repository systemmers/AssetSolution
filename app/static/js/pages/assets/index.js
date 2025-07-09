/**
 * 자산 목록 페이지 JavaScript 기능 (호환성 유지용)
 * 
 * 이 파일은 기존 코드와의 호환성을 위해 유지됩니다.
 * 모든 기능은 /list 디렉토리의 모듈들로 분리되었습니다.
 * 
 * 새로운 코드에서는 다음과 같이 직접 import하세요:
 * import AssetList from '../assets/list/index.js';
 * 
 * 또는 특정 모듈만 가져오기:
 * import { initAssetTable } from '../assets/list/AssetListCore.js';
 * import { initSearchForm } from '../assets/list/AssetListSearch.js';
 * import { initViewModeToggle } from '../assets/list/AssetListView.js';
 * import { initAssetActionButtons } from '../assets/list/AssetStatusManager.js';
 */

import AssetList from './list/index.js';

// 이전 코드와의 호환성을 위해 동일한 API 제공
export default AssetList;