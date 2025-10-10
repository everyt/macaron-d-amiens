/**
 * 메인 메뉴 시스템
 */
class MainMenu {
    constructor() {
        this.currentMenu = 'main';
        this.isTransitioning = false;
        
        this.initializeElements();
        this.setupEventListeners();
        this.startMenuAnimation();
    }
    
    initializeElements() {
        this.elements = {
            mainMenu: document.getElementById('main-menu'),
            gameContainer: document.getElementById('game-container'),
            startBtn: document.getElementById('start-btn'),
            continueBtn: document.getElementById('continue-btn'),
            optionBtn: document.getElementById('option-btn'),
            quitBtn: document.getElementById('quit-btn'),
            characterIllustration: document.getElementById('character-illustration')
        };
    }
    
    setupEventListeners() {
        // 메뉴 버튼 이벤트
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.continueBtn.addEventListener('click', () => this.continueGame());
        this.elements.optionBtn.addEventListener('click', () => this.showOptions());
        this.elements.quitBtn.addEventListener('click', () => this.quitGame());
        
        // 키보드 이벤트
        document.addEventListener('keydown', (e) => {
            if (this.isTransitioning) return;
            
            switch(e.key) {
                case 'Enter':
                    if (this.currentMenu === 'main') {
                        this.startGame();
                    }
                    break;
                case 'Escape':
                    if (this.currentMenu === 'options') {
                        this.hideOptions();
                    }
                    break;
                case 'ArrowUp':
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateMenu(e.key === 'ArrowUp' ? -1 : 1);
                    break;
            }
        });
        
        // 마우스 호버 효과
        this.setupHoverEffects();
    }
    
    setupHoverEffects() {
        const menuButtons = document.querySelectorAll('.menu-button');
        menuButtons.forEach((button, index) => {
            button.addEventListener('mouseenter', () => {
                this.highlightButton(index);
            });
            
            button.addEventListener('mouseleave', () => {
                this.clearHighlights();
            });
        });
    }
    
    highlightButton(index) {
        const buttons = document.querySelectorAll('.menu-button');
        buttons.forEach((btn, i) => {
            if (i === index) {
                btn.style.transform = 'translateY(-2px) scale(1.05)';
                btn.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.3)';
            }
        });
    }
    
    clearHighlights() {
        const buttons = document.querySelectorAll('.menu-button');
        buttons.forEach(btn => {
            btn.style.transform = '';
            btn.style.boxShadow = '';
        });
    }
    
    navigateMenu(direction) {
        const buttons = document.querySelectorAll('.menu-button');
        const currentIndex = Array.from(buttons).findIndex(btn => 
            btn.style.backgroundColor === 'rgb(44, 44, 44)' || 
            btn.style.backgroundColor === 'rgb(139, 0, 0)'
        );
        
        let newIndex = currentIndex + direction;
        if (newIndex < 0) newIndex = buttons.length - 1;
        if (newIndex >= buttons.length) newIndex = 0;
        
        this.selectButton(newIndex);
    }
    
    selectButton(index) {
        const buttons = document.querySelectorAll('.menu-button');
        buttons.forEach((btn, i) => {
            if (i === index) {
                btn.style.backgroundColor = '#2c2c2c';
                btn.style.color = '#ffffff';
            } else {
                btn.style.backgroundColor = 'transparent';
                btn.style.color = '#2c2c2c';
            }
        });
    }
    
    startMenuAnimation() {
        // 제목 애니메이션
        const title = document.getElementById('main-title');
        title.style.opacity = '0';
        title.style.transform = 'translateY(-30px)';
        
        setTimeout(() => {
            title.style.transition = 'all 1s ease-out';
            title.style.opacity = '1';
            title.style.transform = 'translateY(0)';
        }, 300);
        
        // 부제목 애니메이션
        const subtitle = document.getElementById('subtitle');
        subtitle.style.opacity = '0';
        subtitle.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            subtitle.style.transition = 'all 1s ease-out';
            subtitle.style.opacity = '1';
            subtitle.style.transform = 'translateY(0)';
        }, 600);
        
        // 메뉴 버튼들 애니메이션
        const menuButtons = document.querySelectorAll('.menu-button');
        menuButtons.forEach((button, index) => {
            button.style.opacity = '0';
            button.style.transform = 'translateX(-30px)';
            
            setTimeout(() => {
                button.style.transition = 'all 0.8s ease-out';
                button.style.opacity = '1';
                button.style.transform = 'translateX(0)';
            }, 900 + (index * 150));
        });
        
        // 캐릭터 애니메이션
        const character = this.elements.characterIllustration;
        character.style.opacity = '0';
        character.style.transform = 'translateX(30px)';
        
        setTimeout(() => {
            character.style.transition = 'all 1.2s ease-out';
            character.style.opacity = '1';
            character.style.transform = 'translateX(0)';
        }, 1200);
    }
    
    startGame() {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        console.log('게임 시작');
        
        // 페이드 아웃 효과
        this.elements.mainMenu.style.transition = 'opacity 0.5s ease-out';
        this.elements.mainMenu.style.opacity = '0';
        
        setTimeout(() => {
            this.elements.mainMenu.classList.add('hidden');
            this.elements.gameContainer.classList.remove('hidden');
            
            // 게임 초기화
            if (window.Game) {
                window.Game.startGame();
            }
            
            this.isTransitioning = false;
        }, 500);
    }
    
    continueGame() {
        if (this.isTransitioning) return;
        
        console.log('게임 불러오기');
        
        // 저장된 게임이 있는지 확인
        const saveSystem = window.SaveSystem;
        if (saveSystem) {
            const saveSlots = saveSystem.getSaveSlots();
            const hasSave = saveSlots.some(slot => !slot.isEmpty);
            
            if (hasSave) {
                // 저장된 게임이 있으면 불러오기 모달 표시
                if (window.VisualNovel) {
                    window.VisualNovel.showLoadModal();
                }
            } else {
                // 저장된 게임이 없으면 알림
                this.showMessage('저장된 게임이 없습니다.');
            }
        }
    }
    
    showOptions() {
        if (this.isTransitioning) return;
        
        console.log('설정 열기');
        
        if (window.VisualNovel) {
            window.VisualNovel.showSettingsModal();
        }
    }
    
    quitGame() {
        if (this.isTransitioning) return;
        
        console.log('게임 종료');
        
        // 확인 대화상자
        if (confirm('정말로 게임을 종료하시겠습니까?')) {
            // NW.js 환경에서만 작동
            if (typeof nw !== 'undefined') {
                nw.Window.get().close();
            } else {
                // 브라우저에서는 페이지 닫기
                window.close();
            }
        }
    }
    
    showMessage(message) {
        // 간단한 메시지 표시 (실제 구현에서는 더 세련된 모달 사용)
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 20px 40px;
            border-radius: 10px;
            font-family: 'Crimson Text', serif;
            font-size: 16px;
            z-index: 1000;
            animation: fadeIn 0.3s ease-in;
        `;
        messageDiv.textContent = message;
        
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(messageDiv);
            }, 300);
        }, 2000);
    }
    
    hideOptions() {
        if (window.VisualNovel) {
            window.VisualNovel.hideAllModals();
        }
    }
    
    // 메인 메뉴로 돌아가기
    returnToMainMenu() {
        this.isTransitioning = true;
        
        this.elements.gameContainer.style.transition = 'opacity 0.5s ease-out';
        this.elements.gameContainer.style.opacity = '0';
        
        setTimeout(() => {
            this.elements.gameContainer.classList.add('hidden');
            this.elements.mainMenu.classList.remove('hidden');
            this.elements.mainMenu.style.opacity = '1';
            
            this.isTransitioning = false;
        }, 500);
    }
}

// 전역 인스턴스
window.MainMenu = new MainMenu();
