/**
 * 대화 시스템
 */
class DialogueSystem {
    constructor() {
        this.dialogueHistory = [];
        this.currentDialogue = null;
        this.isProcessing = false;
        this.textEffects = new Map();
        
        this.initializeTextEffects();
    }
    
    // 텍스트 효과 초기화
    initializeTextEffects() {
        this.textEffects.set('typewriter', this.typewriterEffect.bind(this));
        this.textEffects.set('fade', this.fadeEffect.bind(this));
        this.textEffects.set('slide', this.slideEffect.bind(this));
        this.textEffects.set('bounce', this.bounceEffect.bind(this));
    }
    
    // 대화 처리
    processDialogue(dialogueData) {
        if (this.isProcessing) return;
        
        this.isProcessing = true;
        this.currentDialogue = dialogueData;
        
        // 대화 히스토리에 추가
        this.dialogueHistory.push({
            ...dialogueData,
            timestamp: Date.now()
        });
        
        // 캐릭터 이름 설정
        this.setCharacterName(dialogueData.characterName);
        
        // 텍스트 효과 적용
        const effect = dialogueData.textEffect || 'typewriter';
        if (this.textEffects.has(effect)) {
            this.textEffects.get(effect)(dialogueData.text);
        } else {
            this.displayText(dialogueData.text);
        }
        
        // 선택지 처리
        if (dialogueData.choices) {
            this.showChoices(dialogueData.choices);
        }
        
        // 사운드 재생
        if (dialogueData.sound) {
            this.playDialogueSound(dialogueData.sound);
        }
        
        this.isProcessing = false;
    }
    
    // 캐릭터 이름 설정
    setCharacterName(name) {
        const nameElement = document.getElementById('character-name');
        if (nameElement) {
            nameElement.textContent = name || '';
        }
    }
    
    // 기본 텍스트 표시
    displayText(text) {
        const textElement = document.getElementById('dialogue-text');
        if (textElement) {
            textElement.textContent = text;
        }
    }
    
    // 타이프라이터 효과
    typewriterEffect(text, speed = 50) {
        const textElement = document.getElementById('dialogue-text');
        if (!textElement) return;
        
        textElement.textContent = '';
        let index = 0;
        
        const typeInterval = setInterval(() => {
            if (index < text.length) {
                textElement.textContent += text[index];
                index++;
            } else {
                clearInterval(typeInterval);
                this.onTextComplete();
            }
        }, speed);
    }
    
    // 페이드 효과
    fadeEffect(text) {
        const textElement = document.getElementById('dialogue-text');
        if (!textElement) return;
        
        textElement.style.opacity = '0';
        textElement.textContent = text;
        
        setTimeout(() => {
            textElement.style.transition = 'opacity 0.5s ease-in';
            textElement.style.opacity = '1';
            setTimeout(() => {
                this.onTextComplete();
            }, 500);
        }, 100);
    }
    
    // 슬라이드 효과
    slideEffect(text) {
        const textElement = document.getElementById('dialogue-text');
        if (!textElement) return;
        
        textElement.style.transform = 'translateY(20px)';
        textElement.style.opacity = '0';
        textElement.textContent = text;
        
        setTimeout(() => {
            textElement.style.transition = 'all 0.3s ease-out';
            textElement.style.transform = 'translateY(0)';
            textElement.style.opacity = '1';
            setTimeout(() => {
                this.onTextComplete();
            }, 300);
        }, 100);
    }
    
    // 바운스 효과
    bounceEffect(text) {
        const textElement = document.getElementById('dialogue-text');
        if (!textElement) return;
        
        textElement.style.transform = 'scale(0.8)';
        textElement.style.opacity = '0';
        textElement.textContent = text;
        
        setTimeout(() => {
            textElement.style.transition = 'all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
            textElement.style.transform = 'scale(1)';
            textElement.style.opacity = '1';
            setTimeout(() => {
                this.onTextComplete();
            }, 400);
        }, 100);
    }
    
    // 텍스트 완료 콜백
    onTextComplete() {
        // 화살표 표시
        const arrowElement = document.getElementById('dialogue-arrow');
        if (arrowElement) {
            arrowElement.style.display = 'block';
        }
        
        // 이벤트 발생
        const event = new CustomEvent('dialogueComplete', {
            detail: { dialogue: this.currentDialogue }
        });
        document.dispatchEvent(event);
    }
    
    // 선택지 표시
    showChoices(choices) {
        const choiceContainer = document.getElementById('choice-container');
        const choiceList = document.getElementById('choice-list');
        
        if (!choiceContainer || !choiceList) return;
        
        choiceList.innerHTML = '';
        
        choices.forEach((choice, index) => {
            const choiceElement = document.createElement('div');
            choiceElement.className = 'choice-item';
            choiceElement.textContent = choice.text;
            
            // 선택지 클릭 이벤트
            choiceElement.addEventListener('click', () => {
                this.selectChoice(index, choice);
            });
            
            // 선택지 애니메이션
            choiceElement.style.opacity = '0';
            choiceElement.style.transform = 'translateY(20px)';
            
            choiceList.appendChild(choiceElement);
            
            // 순차적으로 나타나는 애니메이션
            setTimeout(() => {
                choiceElement.style.transition = 'all 0.3s ease-out';
                choiceElement.style.opacity = '1';
                choiceElement.style.transform = 'translateY(0)';
            }, index * 100);
        });
        
        choiceContainer.classList.remove('hidden');
    }
    
    // 선택지 선택
    selectChoice(choiceIndex, choice) {
        const choiceContainer = document.getElementById('choice-container');
        if (choiceContainer) {
            choiceContainer.classList.add('hidden');
        }
        
        // 선택 이벤트 발생
        const event = new CustomEvent('choiceSelected', {
            detail: { 
                choiceIndex: choiceIndex, 
                choice: choice,
                dialogue: this.currentDialogue
            }
        });
        document.dispatchEvent(event);
    }
    
    // 대화 사운드 재생
    playDialogueSound(soundData) {
        if (window.SoundEngine && soundData) {
            if (soundData.type === 'voice') {
                window.SoundEngine.playVoice(soundData.file, soundData.volume || 1.0);
            } else if (soundData.type === 'sfx') {
                window.SoundEngine.playSFX(soundData.file, soundData.volume || 1.0);
            }
        }
    }
    
    // 대화 히스토리 조회
    getDialogueHistory() {
        return [...this.dialogueHistory];
    }
    
    // 대화 히스토리 초기화
    clearDialogueHistory() {
        this.dialogueHistory = [];
    }
    
    // 특정 캐릭터의 대화만 조회
    getCharacterDialogue(characterName) {
        return this.dialogueHistory.filter(dialogue => 
            dialogue.characterName === characterName
        );
    }
    
    // 대화 검색
    searchDialogue(keyword) {
        return this.dialogueHistory.filter(dialogue => 
            dialogue.text.toLowerCase().includes(keyword.toLowerCase()) ||
            (dialogue.characterName && dialogue.characterName.toLowerCase().includes(keyword.toLowerCase()))
        );
    }
    
    // 대화 통계
    getDialogueStats() {
        const stats = {
            totalDialogue: this.dialogueHistory.length,
            characters: {},
            totalWords: 0,
            averageWordsPerDialogue: 0
        };
        
        this.dialogueHistory.forEach(dialogue => {
            // 캐릭터별 대화 수
            if (dialogue.characterName) {
                stats.characters[dialogue.characterName] = 
                    (stats.characters[dialogue.characterName] || 0) + 1;
            }
            
            // 단어 수 계산
            const wordCount = dialogue.text.split(/\s+/).length;
            stats.totalWords += wordCount;
        });
        
        stats.averageWordsPerDialogue = stats.totalDialogue > 0 ? 
            Math.round(stats.totalWords / stats.totalDialogue) : 0;
        
        return stats;
    }
    
    // 대화 내보내기
    exportDialogueHistory(format = 'json') {
        const data = {
            exportDate: new Date().toISOString(),
            totalDialogue: this.dialogueHistory.length,
            dialogueHistory: this.dialogueHistory,
            stats: this.getDialogueStats()
        };
        
        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else if (format === 'txt') {
            let text = `대화 히스토리 내보내기\n`;
            text += `내보내기 날짜: ${data.exportDate}\n`;
            text += `총 대화 수: ${data.totalDialogue}\n\n`;
            
            data.dialogueHistory.forEach((dialogue, index) => {
                text += `[${index + 1}] ${dialogue.characterName || '나레이션'}\n`;
                text += `${dialogue.text}\n\n`;
            });
            
            return text;
        }
        
        return null;
    }
}

// 전역 인스턴스
window.DialogueSystem = new DialogueSystem();
