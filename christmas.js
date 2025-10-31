// Christmas Theme JavaScript

(function() {
    'use strict';

    // Configuration
    const config = {
        snowflakeCount: 50,
        snowflakeChars: ['❄', '❅', '❆', '✻', '✼', '❉'],
        autoPlay: true
    };

    // Create snowfall effect
    function createSnowfall() {
        // Create container
        const container = document.createElement('div');
        container.className = 'snowflake-container';
        document.body.appendChild(container);

        // Create snowflakes
        for (let i = 0; i < config.snowflakeCount; i++) {
            createSnowflake(container);
        }
    }

    function createSnowflake(container) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        
        // Random snowflake character
        const char = config.snowflakeChars[Math.floor(Math.random() * config.snowflakeChars.length)];
        snowflake.textContent = char;
        
        // Random horizontal position
        snowflake.style.left = Math.random() * 100 + '%';
        
        // Random size
        const size = Math.random() * 0.8 + 0.5; // 0.5 to 1.3
        snowflake.style.fontSize = size + 'em';
        
        // Random animation duration (slower = more realistic)
        const duration = Math.random() * 10 + 10; // 10 to 20 seconds
        snowflake.style.animationDuration = duration + 's';
        
        // Random delay
        const delay = Math.random() * 10;
        snowflake.style.animationDelay = delay + 's';
        
        container.appendChild(snowflake);
        
        // Remove and recreate snowflake after animation completes
        setTimeout(() => {
            snowflake.remove();
            createSnowflake(container);
        }, (duration + delay) * 1000);
    }

    // Web Audio API - Synthesize Jingle Bells melody
    let audioContext;
    let isPlaying = false;
    let currentTimeout;

    function playJingleBells() {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Jingle Bells melody notes (simplified version)
        const melody = [
            { note: 'E4', duration: 0.25 },
            { note: 'E4', duration: 0.25 },
            { note: 'E4', duration: 0.5 },
            { note: 'E4', duration: 0.25 },
            { note: 'E4', duration: 0.25 },
            { note: 'E4', duration: 0.5 },
            { note: 'E4', duration: 0.25 },
            { note: 'G4', duration: 0.25 },
            { note: 'C4', duration: 0.25 },
            { note: 'D4', duration: 0.25 },
            { note: 'E4', duration: 1 },
            { note: 'F4', duration: 0.25 },
            { note: 'F4', duration: 0.25 },
            { note: 'F4', duration: 0.25 },
            { note: 'F4', duration: 0.25 },
            { note: 'F4', duration: 0.25 },
            { note: 'E4', duration: 0.25 },
            { note: 'E4', duration: 0.25 },
            { note: 'E4', duration: 0.25 },
            { note: 'E4', duration: 0.25 },
            { note: 'D4', duration: 0.25 },
            { note: 'D4', duration: 0.25 },
            { note: 'E4', duration: 0.25 },
            { note: 'D4', duration: 0.5 },
            { note: 'G4', duration: 0.5 }
        ];

        const noteFrequencies = {
            'C4': 261.63, 'D4': 293.66, 'E4': 329.63,
            'F4': 349.23, 'G4': 392.00, 'A4': 440.00,
            'B4': 493.88, 'C5': 523.25
        };

        function playNote(frequency, duration, startTime) {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(frequency, startTime);
            
            // Bell-like envelope
            gainNode.gain.setValueAtTime(0, startTime);
            gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.01);
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
            
            oscillator.start(startTime);
            oscillator.stop(startTime + duration);
        }

        function playMelody() {
            if (!isPlaying) return;
            
            let currentTime = audioContext.currentTime;
            let totalDuration = 0;
            
            melody.forEach(({ note, duration }) => {
                const frequency = noteFrequencies[note];
                playNote(frequency, duration * 0.5, currentTime + totalDuration);
                totalDuration += duration * 0.5;
            });
            
            // Loop the melody
            currentTimeout = setTimeout(playMelody, totalDuration * 1000 + 1000);
        }

        playMelody();
    }

    function stopJingleBells() {
        isPlaying = false;
        if (currentTimeout) {
            clearTimeout(currentTimeout);
        }
        if (audioContext) {
            audioContext.close();
            audioContext = null;
        }
    }

    // Create music control
    function createMusicControl() {
        // Create control button
        const button = document.createElement('button');
        button.className = 'christmas-music-control muted';
        button.innerHTML = '<i class="fas fa-bell-slash"></i>';
        button.title = 'Jingle Bells BGM (클릭하여 재생)';
        button.setAttribute('aria-label', 'Toggle Christmas music');
        
        let hasInteracted = false;

        // Click handler
        button.addEventListener('click', () => {
            hasInteracted = true;
            if (isPlaying) {
                stopJingleBells();
                button.classList.remove('playing');
                button.classList.add('muted');
                button.innerHTML = '<i class="fas fa-bell-slash"></i>';
                button.title = 'Jingle Bells BGM (클릭하여 재생)';
            } else {
                isPlaying = true;
                playJingleBells();
                button.classList.add('playing');
                button.classList.remove('muted');
                button.innerHTML = '<i class="fas fa-bell"></i>';
                button.title = 'Jingle Bells BGM (클릭하여 정지)';
            }
        });

        document.body.appendChild(button);

        // Wait for user interaction before enabling music
        const enableAudioOnInteraction = () => {
            if (!hasInteracted && config.autoPlay) {
                // Auto-play after first interaction
                setTimeout(() => {
                    button.click();
                }, 500);
                document.removeEventListener('click', enableAudioOnInteraction);
                document.removeEventListener('keydown', enableAudioOnInteraction);
            }
        };
        
        document.addEventListener('click', enableAudioOnInteraction, { once: true });
        document.addEventListener('keydown', enableAudioOnInteraction, { once: true });
    }

    // Add Christmas decorations to navbar
    function decorateNavbar() {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            navbar.classList.add('christmas-theme');
        }
    }

    // Add Christmas lights to header
    function addChristmasLights() {
        const header = document.querySelector('.header');
        if (header) {
            header.classList.add('christmas-lights');
            const lightsStrip = document.createElement('div');
            lightsStrip.className = 'christmas-lights-strip';
            header.insertBefore(lightsStrip, header.firstChild);
        }
    }

    // Add Santa and Rudolph flying animation
    function addSantaSleigh() {
        const header = document.querySelector('.header');
        if (header) {
            const santaSleigh = document.createElement('div');
            santaSleigh.className = 'santa-sleigh';
            santaSleigh.innerHTML = '🦌🎅';
            santaSleigh.title = '산타와 루돌프가 선물을 배달하러 가는 중이에요!';
            header.appendChild(santaSleigh);
        }
    }

    // Add Christmas trees to header
    function addChristmasTrees() {
        const header = document.querySelector('.header');
        if (header) {
            const treesContainer = document.createElement('div');
            treesContainer.className = 'christmas-trees-container';
            
            // Create multiple trees with different decorations
            const treeEmojis = ['🎄', '🎄', '🎄', '🎄', '🎄', '🎄', '🎄', '🎄'];
            
            treeEmojis.forEach((emoji, index) => {
                const tree = document.createElement('div');
                tree.className = 'christmas-tree';
                tree.innerHTML = emoji;
                tree.title = `크리스마스 트리 #${index + 1}`;
                treesContainer.appendChild(tree);
            });
            
            header.appendChild(treesContainer);
        }
    }

    // Initialize everything when DOM is ready
    function init() {
        createSnowfall();
        createMusicControl();
        decorateNavbar();
        addChristmasLights();
        addSantaSleigh();
        addChristmasTrees();
        
        console.log('🎄 메리 크리스마스! Christmas theme loaded successfully! 🎅🦌');
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
