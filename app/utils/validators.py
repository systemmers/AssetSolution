from typing import Dict, Any


def validate_asset_data(asset_data: Dict[str, Any], is_update: bool = False) -> Dict[str, Any]:
    """
    자산 데이터 검증 및 변환
    
    Args:
        asset_data: 검증할 자산 데이터
        is_update: 업데이트 모드 여부
        
    Returns:
        Dict[str, Any]: 검증된 자산 데이터
    """
    validated_data = asset_data.copy()
    
    # 가격 검증 및 변환
    if 'purchase_price' in validated_data:
        try:
            validated_data['purchase_price'] = float(validated_data['purchase_price'])
        except (ValueError, TypeError):
            validated_data['purchase_price'] = 0
    
    # 내용연수 검증 및 변환
    if 'useful_life' in validated_data:
        try:
            validated_data['useful_life'] = int(validated_data['useful_life'])
        except (ValueError, TypeError):
            validated_data['useful_life'] = 36  # 기본값
    
    return validated_data