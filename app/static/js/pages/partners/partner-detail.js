/**
 * 협력사 상세 페이지 JavaScript
 * 발주서 생성 및 견적서 요청 기능
 */

document.addEventListener('DOMContentLoaded', function() {
    // 전역 변수
    let itemCounter = 1;
    
    // DOM 요소 참조
    const addItemBtn = document.getElementById('addItemBtn');
    const itemsContainer = document.getElementById('itemsContainer');
    const totalItemsSpan = document.getElementById('totalItems');
    const totalAmountSpan = document.getElementById('totalAmount');
    const purchaseOrderForm = document.getElementById('purchaseOrderForm');
    const quotationRequestForm = document.getElementById('quotationRequestForm');
    
    // 발주서 모달이 열릴 때 초기화
    const purchaseOrderModal = document.getElementById('purchaseOrderModal');
    if (purchaseOrderModal) {
        purchaseOrderModal.addEventListener('shown.bs.modal', function() {
            initializePurchaseOrderModal();
        });
    }
    
    // 견적서 요청 모달이 열릴 때 초기화
    const quotationRequestModal = document.getElementById('quotationRequestModal');
    if (quotationRequestModal) {
        quotationRequestModal.addEventListener('shown.bs.modal', function() {
            initializeQuotationRequestModal();
        });
    }
    
    /**
     * 발주서 모달 초기화
     */
    function initializePurchaseOrderModal() {
        // 현재 날짜 설정
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('po_date').value = today;
        
        // 납기일자 기본값 (7일 후)
        const deliveryDate = new Date();
        deliveryDate.setDate(deliveryDate.getDate() + 7);
        document.getElementById('delivery_date').value = deliveryDate.toISOString().split('T')[0];
        
        // 품목 추가 버튼 이벤트
        if (addItemBtn) {
            addItemBtn.addEventListener('click', addNewItem);
        }
        
        // 초기 품목 행 이벤트 바인딩
        bindItemEvents();
        
        // 총액 계산
        calculateTotal();
    }
    
    /**
     * 견적서 요청 모달 초기화
     */
    function initializeQuotationRequestModal() {
        // 견적 마감일 기본값 (7일 후)
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + 7);
        document.getElementById('quote_deadline').value = deadline.toISOString().split('T')[0];
    }
    
    /**
     * 새 품목 행 추가
     */
    function addNewItem() {
        const newItemHtml = `
            <div class="item-row mb-3 p-3 border rounded">
                <div class="row">
                    <div class="col-12 mb-2">
                        <label class="form-label">품목명 <span class="text-danger">*</span></label>
                        <input type="text" class="form-control item-name" name="items[${itemCounter}][name]" 
                               placeholder="품목명을 입력하세요" required>
                    </div>
                    <div class="col-4 mb-2">
                        <label class="form-label">수량 <span class="text-danger">*</span></label>
                        <input type="number" class="form-control item-quantity" name="items[${itemCounter}][quantity]" 
                               min="1" value="1" required>
                    </div>
                    <div class="col-4 mb-2">
                        <label class="form-label">단가 <span class="text-danger">*</span></label>
                        <input type="number" class="form-control item-price" name="items[${itemCounter}][price]" 
                               min="0" step="0.01" placeholder="0" required>
                    </div>
                    <div class="col-4 mb-2">
                        <label class="form-label">금액</label>
                        <input type="text" class="form-control item-total" readonly>
                    </div>
                    <div class="col-12">
                        <label class="form-label">품목 설명</label>
                        <textarea class="form-control" name="items[${itemCounter}][description]" rows="2" 
                                  placeholder="품목에 대한 상세 설명"></textarea>
                    </div>
                </div>
                <button type="button" class="btn btn-sm btn-outline-danger remove-item-btn mt-2">
                    <i class="fas fa-trash me-1"></i>삭제
                </button>
            </div>
        `;
        
        itemsContainer.insertAdjacentHTML('beforeend', newItemHtml);
        itemCounter++;
        
        // 새로 추가된 품목 행에 이벤트 바인딩
        bindItemEvents();
        updateRemoveButtons();
        calculateTotal();
    }
    
    /**
     * 품목 행 이벤트 바인딩
     */
    function bindItemEvents() {
        // 수량, 단가 변경 시 금액 계산
        const quantityInputs = document.querySelectorAll('.item-quantity');
        const priceInputs = document.querySelectorAll('.item-price');
        
        quantityInputs.forEach(input => {
            input.removeEventListener('input', calculateItemTotal);
            input.addEventListener('input', calculateItemTotal);
        });
        
        priceInputs.forEach(input => {
            input.removeEventListener('input', calculateItemTotal);
            input.addEventListener('input', calculateItemTotal);
        });
        
        // 삭제 버튼 이벤트
        const removeButtons = document.querySelectorAll('.remove-item-btn');
        removeButtons.forEach(button => {
            button.removeEventListener('click', removeItem);
            button.addEventListener('click', removeItem);
        });
    }
    
    /**
     * 개별 품목 금액 계산
     */
    function calculateItemTotal(event) {
        const itemRow = event.target.closest('.item-row');
        const quantity = parseFloat(itemRow.querySelector('.item-quantity').value) || 0;
        const price = parseFloat(itemRow.querySelector('.item-price').value) || 0;
        const total = quantity * price;
        
        const totalInput = itemRow.querySelector('.item-total');
        totalInput.value = formatCurrency(total);
        
        calculateTotal();
    }
    
    /**
     * 전체 총액 계산
     */
    function calculateTotal() {
        const itemRows = document.querySelectorAll('.item-row');
        let totalAmount = 0;
        let totalItems = itemRows.length;
        
        itemRows.forEach(row => {
            const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            totalAmount += quantity * price;
        });
        
        if (totalItemsSpan) {
            totalItemsSpan.textContent = totalItems;
        }
        if (totalAmountSpan) {
            totalAmountSpan.textContent = formatCurrency(totalAmount);
        }
    }
    
    /**
     * 품목 행 삭제
     */
    function removeItem(event) {
        const itemRow = event.target.closest('.item-row');
        itemRow.remove();
        updateRemoveButtons();
        calculateTotal();
    }
    
    /**
     * 삭제 버튼 표시/숨김 업데이트
     */
    function updateRemoveButtons() {
        const itemRows = document.querySelectorAll('.item-row');
        const removeButtons = document.querySelectorAll('.remove-item-btn');
        
        if (itemRows.length <= 1) {
            // 품목이 1개만 있으면 삭제 버튼 숨김
            removeButtons.forEach(button => {
                button.style.display = 'none';
            });
        } else {
            // 품목이 2개 이상이면 삭제 버튼 표시
            removeButtons.forEach(button => {
                button.style.display = 'inline-block';
            });
        }
    }
    
    /**
     * 통화 형식으로 포맷
     */
    function formatCurrency(amount) {
        return new Intl.NumberFormat('ko-KR').format(Math.round(amount));
    }
    
    /**
     * 발주서 폼 유효성 검증
     */
    function validatePurchaseOrderForm() {
        const form = purchaseOrderForm;
        let isValid = true;
        const errors = [];
        
        // 필수 필드 검증
        const requiredFields = [
            { id: 'po_number', name: '발주번호' },
            { id: 'po_date', name: '발주일자' },
            { id: 'delivery_date', name: '납기일자' }
        ];
        
        requiredFields.forEach(field => {
            const input = document.getElementById(field.id);
            if (!input.value.trim()) {
                errors.push(`${field.name}을(를) 입력해주세요.`);
                input.classList.add('is-invalid');
                isValid = false;
            } else {
                input.classList.remove('is-invalid');
            }
        });
        
        // 품목 검증
        const itemRows = document.querySelectorAll('.item-row');
        let hasValidItem = false;
        
        itemRows.forEach((row, index) => {
            const name = row.querySelector('.item-name').value.trim();
            const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            
            if (name && quantity > 0 && price >= 0) {
                hasValidItem = true;
            }
            
            if (!name) {
                row.querySelector('.item-name').classList.add('is-invalid');
                isValid = false;
            } else {
                row.querySelector('.item-name').classList.remove('is-invalid');
            }
            
            if (quantity <= 0) {
                row.querySelector('.item-quantity').classList.add('is-invalid');
                isValid = false;
            } else {
                row.querySelector('.item-quantity').classList.remove('is-invalid');
            }
            
            if (price < 0) {
                row.querySelector('.item-price').classList.add('is-invalid');
                isValid = false;
            } else {
                row.querySelector('.item-price').classList.remove('is-invalid');
            }
        });
        
        if (!hasValidItem) {
            errors.push('최소 1개 이상의 유효한 품목을 입력해주세요.');
            isValid = false;
        }
        
        // 날짜 검증
        const poDate = new Date(document.getElementById('po_date').value);
        const deliveryDate = new Date(document.getElementById('delivery_date').value);
        
        if (deliveryDate <= poDate) {
            errors.push('납기일자는 발주일자보다 늦어야 합니다.');
            document.getElementById('delivery_date').classList.add('is-invalid');
            isValid = false;
        } else {
            document.getElementById('delivery_date').classList.remove('is-invalid');
        }
        
        // 오류 메시지 표시
        if (!isValid) {
            showValidationErrors(errors);
        }
        
        return isValid;
    }
    
    /**
     * 견적서 요청 폼 유효성 검증
     */
    function validateQuotationRequestForm() {
        const form = quotationRequestForm;
        let isValid = true;
        const errors = [];
        
        // 필수 필드 검증
        const requiredFields = [
            { id: 'quote_title', name: '견적 제목' },
            { id: 'quote_deadline', name: '견적 마감일' },
            { id: 'quote_description', name: '견적 요청 내용' }
        ];
        
        requiredFields.forEach(field => {
            const input = document.getElementById(field.id);
            if (!input.value.trim()) {
                errors.push(`${field.name}을(를) 입력해주세요.`);
                input.classList.add('is-invalid');
                isValid = false;
            } else {
                input.classList.remove('is-invalid');
            }
        });
        
        // 마감일 검증 (오늘 이후여야 함)
        const deadline = new Date(document.getElementById('quote_deadline').value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (deadline <= today) {
            errors.push('견적 마감일은 오늘 이후로 설정해주세요.');
            document.getElementById('quote_deadline').classList.add('is-invalid');
            isValid = false;
        } else {
            document.getElementById('quote_deadline').classList.remove('is-invalid');
        }
        
        // 이메일 형식 검증
        const email = document.getElementById('contact_email').value.trim();
        if (email && !isValidEmail(email)) {
            errors.push('올바른 이메일 형식을 입력해주세요.');
            document.getElementById('contact_email').classList.add('is-invalid');
            isValid = false;
        } else {
            document.getElementById('contact_email').classList.remove('is-invalid');
        }
        
        // 오류 메시지 표시
        if (!isValid) {
            showValidationErrors(errors);
        }
        
        return isValid;
    }
    
    /**
     * 이메일 형식 검증
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    /**
     * 유효성 검증 오류 메시지 표시
     */
    function showValidationErrors(errors) {
        const errorMessage = errors.join('\n');
        alert(errorMessage);
    }
    
    /**
     * 성공 메시지 표시
     */
    function showSuccessMessage(message) {
        // Bootstrap Toast 또는 Alert 사용
        const alertHtml = `
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="fas fa-check-circle me-2"></i>${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `;
        
        // 페이지 상단에 알림 추가
        const container = document.querySelector('.container-fluid') || document.body;
        container.insertAdjacentHTML('afterbegin', alertHtml);
        
        // 3초 후 자동 제거
        setTimeout(() => {
            const alert = container.querySelector('.alert-success');
            if (alert) {
                alert.remove();
            }
        }, 3000);
    }
    
    // 발주서 폼 제출 처리
    $('#purchaseOrderForm').on('submit', function(e) {
        e.preventDefault();
        
        if (!PartnerDetailManager.validatePurchaseOrderForm()) {
            return;
        }
        
        // 폼 데이터 수집
        const formData = new FormData(this);
        const partnerId = window.location.pathname.split('/').pop();
        
        // 동적 품목 데이터 추가
        const items = [];
        $('#purchaseOrderItems .purchase-order-item').each(function(index) {
            const item = {
                name: $(this).find('input[name$="[name]"]').val(),
                quantity: parseInt($(this).find('input[name$="[quantity]"]').val()) || 0,
                unit_price: parseFloat($(this).find('input[name$="[unit_price]"]').val()) || 0,
                description: $(this).find('input[name$="[description]"]').val()
            };
            
            if (item.name && item.quantity > 0 && item.unit_price > 0) {
                items.push(item);
            }
        });
        
        const orderData = {
            order_date: formData.get('order_date'),
            delivery_date: formData.get('delivery_date'),
            delivery_address: formData.get('delivery_address'),
            notes: formData.get('notes'),
            items: items
        };
        
        // AJAX 요청으로 발주서 생성
        $.ajax({
            url: `/assets/partners/${partnerId}/purchase-orders`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(orderData),
            success: function(response) {
                if (response.success) {
                    PartnerDetailManager.showMessage(response.message, 'success');
                    $('#purchaseOrderModal').modal('hide');
                    // 폼 초기화
                    $('#purchaseOrderForm')[0].reset();
                    $('#purchaseOrderItems').empty();
                    PartnerDetailManager.addPurchaseOrderItem();
                    PartnerDetailManager.calculatePurchaseOrderTotals();
                } else {
                    PartnerDetailManager.showMessage(response.message, 'error');
                }
            },
            error: function(xhr) {
                const response = xhr.responseJSON || {};
                const message = response.message || '발주서 생성 중 오류가 발생했습니다.';
                PartnerDetailManager.showMessage(message, 'error');
            }
        });
    });
    
    // 견적서 요청 폼 제출 처리
    $('#quotationRequestForm').on('submit', function(e) {
        e.preventDefault();
        
        if (!PartnerDetailManager.validateQuotationRequestForm()) {
            return;
        }
        
        // 폼 데이터 수집
        const formData = new FormData(this);
        const partnerId = window.location.pathname.split('/').pop();
        
        const requestData = {
            title: formData.get('title'),
            description: formData.get('description'),
            deadline: formData.get('deadline'),
            budget_range: formData.get('budget_range'),
            contact_name: formData.get('contact_name'),
            contact_phone: formData.get('contact_phone'),
            contact_email: formData.get('contact_email'),
            special_requirements: formData.get('special_requirements')
        };
        
        // AJAX 요청으로 견적서 요청 생성
        $.ajax({
            url: `/assets/partners/${partnerId}/quotation-requests`,
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify(requestData),
            success: function(response) {
                if (response.success) {
                    PartnerDetailManager.showMessage(response.message, 'success');
                    $('#quotationRequestModal').modal('hide');
                    // 폼 초기화
                    $('#quotationRequestForm')[0].reset();
                } else {
                    PartnerDetailManager.showMessage(response.message, 'error');
                }
            },
            error: function(xhr) {
                const response = xhr.responseJSON || {};
                const message = response.message || '견적서 요청 생성 중 오류가 발생했습니다.';
                PartnerDetailManager.showMessage(message, 'error');
            }
        });
    });
    
    // 초기화
    updateRemoveButtons();

    // 탭 전환 이벤트 처리
    document.addEventListener('shown.bs.tab', function (event) {
        const targetTab = event.target.getAttribute('href') || event.target.getAttribute('data-bs-target');
        
        if (targetTab === '#purchase-orders') {
            loadPurchaseOrders();
        } else if (targetTab === '#quotation-requests') {
            loadQuotationRequests();
        }
    });

    // 발주서 이력 로드
    function loadPurchaseOrders() {
        const partnerId = getPartnerId();
        const container = document.getElementById('purchaseOrdersList');
        
        fetch(`/api/partners/${partnerId}/purchase-orders`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.purchase_orders.length > 0) {
                    container.innerHTML = renderPurchaseOrdersList(data.purchase_orders);
                } else {
                    container.innerHTML = `
                        <div class="text-center text-muted py-4">
                            <i class="fas fa-file-invoice fa-3x mb-3"></i>
                            <p>발주서 이력이 없습니다.</p>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('발주서 이력 로드 실패:', error);
                container.innerHTML = `
                    <div class="text-center text-danger py-4">
                        <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                        <p>발주서 이력을 불러오는데 실패했습니다.</p>
                    </div>
                `;
            });
    }

    // 견적서 요청 이력 로드
    function loadQuotationRequests() {
        const partnerId = getPartnerId();
        const container = document.getElementById('quotationRequestsList');
        
        fetch(`/api/partners/${partnerId}/quotation-requests`)
            .then(response => response.json())
            .then(data => {
                if (data.success && data.quotation_requests.length > 0) {
                    container.innerHTML = renderQuotationRequestsList(data.quotation_requests);
                } else {
                    container.innerHTML = `
                        <div class="text-center text-muted py-4">
                            <i class="fas fa-file-alt fa-3x mb-3"></i>
                            <p>견적서 요청 이력이 없습니다.</p>
                        </div>
                    `;
                }
            })
            .catch(error => {
                console.error('견적서 요청 이력 로드 실패:', error);
                container.innerHTML = `
                    <div class="text-center text-danger py-4">
                        <i class="fas fa-exclamation-triangle fa-3x mb-3"></i>
                        <p>견적서 요청 이력을 불러오는데 실패했습니다.</p>
                    </div>
                `;
            });
    }

    // 발주서 목록 렌더링
    function renderPurchaseOrdersList(orders) {
        return `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>발주번호</th>
                            <th>발주일자</th>
                            <th>납기일자</th>
                            <th>총 금액</th>
                            <th>상태</th>
                            <th class="text-center">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${orders.map(order => `
                            <tr>
                                <td>
                                    <strong>${order.order_number}</strong>
                                    <br><small class="text-muted">${order.total_items}개 품목</small>
                                </td>
                                <td>${order.order_date}</td>
                                <td>${order.delivery_date}</td>
                                <td class="text-end">
                                    <strong class="text-primary">${formatCurrency(order.total_amount)}</strong>
                                </td>
                                <td>
                                    <span class="badge ${getStatusBadgeClass(order.status)}">${getStatusText(order.status)}</span>
                                </td>
                                <td class="text-center">
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-outline-info" onclick="viewPurchaseOrder(${order.id})" title="상세보기">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn btn-outline-success" onclick="downloadPurchaseOrder(${order.id})" title="PDF 다운로드">
                                            <i class="fas fa-download"></i>
                                        </button>
                                        <button class="btn btn-outline-warning" onclick="resendPurchaseOrder(${order.id})" title="재발송">
                                            <i class="fas fa-paper-plane"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // 견적서 요청 목록 렌더링
    function renderQuotationRequestsList(requests) {
        return `
            <div class="table-responsive">
                <table class="table table-hover">
                    <thead class="table-light">
                        <tr>
                            <th>요청번호</th>
                            <th>제목</th>
                            <th>요청일자</th>
                            <th>마감일자</th>
                            <th>상태</th>
                            <th class="text-center">관리</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${requests.map(request => `
                            <tr>
                                <td>
                                    <strong>${request.request_number}</strong>
                                    <br><small class="text-muted">${request.budget_range || '예산 미정'}</small>
                                </td>
                                <td>
                                    <strong>${request.title}</strong>
                                    <br><small class="text-muted">${truncateText(request.description, 50)}</small>
                                </td>
                                <td>${request.request_date}</td>
                                <td>${request.deadline_date}</td>
                                <td>
                                    <span class="badge ${getStatusBadgeClass(request.status)}">${getStatusText(request.status)}</span>
                                </td>
                                <td class="text-center">
                                    <div class="btn-group btn-group-sm">
                                        <button class="btn btn-outline-info" onclick="viewQuotationRequest(${request.id})" title="상세보기">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button class="btn btn-outline-warning" onclick="resendQuotationRequest(${request.id})" title="재발송">
                                            <i class="fas fa-paper-plane"></i>
                                        </button>
                                        <button class="btn btn-outline-success" onclick="markQuotationReceived(${request.id})" title="견적서 수신">
                                            <i class="fas fa-check"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }

    // 유틸리티 함수들
    function getStatusBadgeClass(status) {
        const statusClasses = {
            'pending': 'bg-warning text-dark',
            'sent': 'bg-info',
            'delivered': 'bg-success',
            'completed': 'bg-primary',
            'cancelled': 'bg-danger'
        };
        return statusClasses[status] || 'bg-secondary';
    }

    function getStatusText(status) {
        const statusTexts = {
            'pending': '대기중',
            'sent': '발송됨',
            'delivered': '전달됨',
            'completed': '완료',
            'cancelled': '취소됨'
        };
        return statusTexts[status] || '알 수 없음';
    }

    function formatCurrency(amount) {
        return new Intl.NumberFormat('ko-KR').format(amount) + '원';
    }

    function truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // 발주서 관련 액션 함수들
    function viewPurchaseOrder(orderId) {
        // 발주서 상세보기 모달 또는 페이지로 이동
        console.log('발주서 상세보기:', orderId);
        // TODO: 발주서 상세보기 구현
    }

    function downloadPurchaseOrder(orderId) {
        // 발주서 PDF 다운로드
        window.open(`/api/purchase-orders/${orderId}/download`, '_blank');
    }

    function resendPurchaseOrder(orderId) {
        if (confirm('발주서를 다시 발송하시겠습니까?')) {
            fetch(`/api/purchase-orders/${orderId}/resend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('success', '발주서가 성공적으로 재발송되었습니다.');
                    loadPurchaseOrders(); // 목록 새로고침
                } else {
                    showAlert('error', data.message || '발주서 재발송에 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('발주서 재발송 실패:', error);
                showAlert('error', '발주서 재발송 중 오류가 발생했습니다.');
            });
        }
    }

    // 견적서 요청 관련 액션 함수들
    function viewQuotationRequest(requestId) {
        // 견적서 요청 상세보기
        console.log('견적서 요청 상세보기:', requestId);
        // TODO: 견적서 요청 상세보기 구현
    }

    function resendQuotationRequest(requestId) {
        if (confirm('견적서 요청을 다시 발송하시겠습니까?')) {
            fetch(`/api/quotation-requests/${requestId}/resend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('success', '견적서 요청이 성공적으로 재발송되었습니다.');
                    loadQuotationRequests(); // 목록 새로고침
                } else {
                    showAlert('error', data.message || '견적서 요청 재발송에 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('견적서 요청 재발송 실패:', error);
                showAlert('error', '견적서 요청 재발송 중 오류가 발생했습니다.');
            });
        }
    }

    function markQuotationReceived(requestId) {
        if (confirm('견적서를 수신하셨습니까? 상태를 완료로 변경합니다.')) {
            fetch(`/api/quotation-requests/${requestId}/mark-received`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('success', '견적서 수신 상태로 변경되었습니다.');
                    loadQuotationRequests(); // 목록 새로고침
                } else {
                    showAlert('error', data.message || '상태 변경에 실패했습니다.');
                }
            })
            .catch(error => {
                console.error('상태 변경 실패:', error);
                showAlert('error', '상태 변경 중 오류가 발생했습니다.');
            });
        }
    }
}); 