// export function initModal(openButton, toggleRainVisibility) {
//     if (!openButton) return;
//     openButton.addEventListener('click', () => {
//         const wrapper = document.createElement('div');
//         wrapper.className = 'modalWrapper';

//         const backdrop = document.createElement('div');
//         backdrop.className = 'backdrop';
//         backdrop.addEventListener('click', () => {
//             wrapper.remove();
//         });

//         const modalWindow = document.createElement('div');
//         modalWindow.className = 'modalWindow';

//         const buttonCross = createModalButton('buttonCross', 'x', closeModal);

//         const settingsHeader = document.createElement('div');
//         settingsHeader.className = "settingsHeader";

//         const settingsHeaderText = document.createElement('h2');
//         settingsHeaderText.textContent = 'Настройки';

//         settingsHeader.appendChild(settingsHeaderText);

//         const themes = document.createElement('div');
//         themes.className = 'themesContainer';

//         const themeText = document.createElement('h2');
//         themeText.className = "themeText";
//         themeText.textContent = 'Темы';

//         const themeTextBlack = document.createElement('div');
//         themeTextBlack.className = "theme-black";

//         const themeLabel = document.createElement('span');
//         themeLabel.className = "theme-label";
//         themeLabel.textContent = 'Темная тема';

//         const toggleContainerBlack = document.createElement('label');
//         toggleContainerBlack.className = "toggle-container";

//         const toggleInputTheme = document.createElement('input');
//         toggleInputTheme.type = "checkbox";
//         toggleInputTheme.className = "toggle-input";
//         toggleInputTheme.checked = localStorage.getItem('darkTheme') === 'true';

//         toggleInputTheme.addEventListener('change', function () {
//             document.body.classList.toggle('dark-theme', this.checked);
//             localStorage.setItem('darkTheme', this.checked);
//         });

//         const toggleSlider = document.createElement('span');
//         toggleSlider.className = "toggle-slider";

//         toggleContainerBlack.appendChild(toggleInputTheme);
//         toggleContainerBlack.appendChild(toggleSlider);
//         themeTextBlack.appendChild(themeLabel);
//         themeTextBlack.appendChild(toggleContainerBlack);

//         const sergeyTheme = document.createElement('div');
//         sergeyTheme.className = 'sergeyTheme';

//         const sergeyThemeText = document.createElement('h2');
//         sergeyThemeText.className = 'sergeyThemeText';
//         sergeyThemeText.textContent = 'Сережка';

//         const toggleContainerSergey = document.createElement('label');
//         toggleContainerSergey.className = 'toggle-container';

//         const toggleInputSergey = document.createElement('input');
//         toggleInputSergey.type = 'checkbox';
//         toggleInputSergey.className = "toggle-input";
//         toggleInputSergey.checked = localStorage.getItem('sergeyRainMode') === 'true';

//         toggleInputSergey.addEventListener('change', function () {
//             const isEnabled = this.checked;
//             if (typeof toggleRainVisibility === 'function') {
//                 toggleRainVisibility(isEnabled);
//             }
//             localStorage.setItem('sergeyRainMode', isEnabled);
//         });

//         const toggleSliderSergey = document.createElement('span');
//         toggleSliderSergey.className = "toggle-slider";

//         sergeyTheme.appendChild(sergeyThemeText);
//         sergeyTheme.appendChild(toggleContainerSergey);

//         toggleContainerSergey.appendChild(toggleInputSergey);
//         toggleContainerSergey.appendChild(toggleSliderSergey);

//         themes.appendChild(themeText);
//         themes.appendChild(themeTextBlack);
//         themes.appendChild(sergeyTheme);

//         wrapper.appendChild(modalWindow);
//         wrapper.appendChild(backdrop);

//         modalWindow.appendChild(buttonCross);
//         modalWindow.appendChild(settingsHeader);
//         modalWindow.appendChild(themes);

//         document.body.appendChild(wrapper);
//     });
// }

// export function closeModal() {
//     const modal = document.querySelector('.modalWrapper')
//     if (!modal) {
//         console.log('Модальное окно не найдено');
//         return;
//     }
//     modal.remove();
// }

// export function createModalButton(className, text, func) {
//     const button = document.createElement('button');
//     button.setAttribute('type', 'button');
//     button.className = className;
//     button.innerText = text;
//     button.addEventListener('click', () => {
//         func();
//     })
//     return button;
// }