// ── FUNCIONES DE CREACIÓN DE ELEMENTOS ───────────────────────────────────────

function createLoginFormLogoSection(component)
{
    var logoSection = document.createElement('div');
    var imgLogo     = document.createElement('img');
    var pTitle      = document.createElement('p');

    imgLogo.id = 'login-logo';
    pTitle.id  = 'login-title';

    imgLogo.src        = component.getAttribute('logo-src') || '';
    imgLogo.alt        = component.getAttribute('logo-alt') || '';
    pTitle.textContent = component.getAttribute('title') || 'LOGIN';

    logoSection.classList.add('w3-center', 'w3-padding-16');
    imgLogo.classList.add('w3-image');

    logoSection.appendChild(imgLogo);
    logoSection.appendChild(pTitle);

    return logoSection;
}

function createLoginFormUsernameField()
{
    var wrapper = document.createElement('div');
    var input   = document.createElement('input');

    input.id          = 'login-input-username';
    input.type        = 'text';
    input.placeholder = 'Nombre de usuario';

    wrapper.classList.add('w3-margin-bottom');
    input.classList.add('w3-input', 'w3-round', 'w3-border');

    wrapper.appendChild(input);

    return wrapper;
}

function createLoginFormPasswordField()
{
    var wrapper = document.createElement('div');
    var input   = document.createElement('input');

    input.id          = 'login-input-password';
    input.type        = 'password';
    input.placeholder = 'Contraseña';

    wrapper.classList.add('w3-margin-bottom');
    input.classList.add('w3-input', 'w3-round', 'w3-border');

    wrapper.appendChild(input);

    return wrapper;
}

function createLoginFormSubmitButton(component)
{
    var button = document.createElement('button');

    button.id          = 'login-submit-btn';
    button.type        = 'button';
    button.textContent = component.getAttribute('button-text') || 'Ingresar';

    button.classList.add('w3-button', 'w3-round', 'w3-margin-bottom', 'w3-primary', 'w3-block');

    return button;
}

function createLoginFormFooter(component)
{
    var cardFooter   = document.createElement('div');
    var pFooter      = document.createElement('p');
    var spanNoAccount = document.createElement('span');
    var aRegister    = document.createElement('a');

    aRegister.id = 'login-register-link';

    aRegister.href        = component.getAttribute('register-url') || 'register.html';
    aRegister.textContent = 'Registrate aquí';
    spanNoAccount.textContent = 'No tenés una cuenta? ';

    cardFooter.classList.add('w3-center', 'w3-border-top');
    pFooter.classList.add('w3-margin');
    spanNoAccount.classList.add('w3-text-warning');

    pFooter.appendChild(spanNoAccount);
    pFooter.appendChild(aRegister);
    cardFooter.appendChild(pFooter);

    return cardFooter;
}

function createLoginFormBody(component)
{
    var cardBody      = document.createElement('div');
    var logoSection   = createLoginFormLogoSection(component);
    var usernameField = createLoginFormUsernameField();
    var passwordField = createLoginFormPasswordField();
    var submitButton  = createLoginFormSubmitButton(component);

    cardBody.classList.add('w3-padding-large');

    cardBody.appendChild(logoSection);
    cardBody.appendChild(usernameField);
    cardBody.appendChild(passwordField);
    cardBody.appendChild(submitButton);

    return cardBody;
}

function createLoginFormCard(component)
{
    var cardWrapper = document.createElement('div');
    var card        = document.createElement('div');
    var cardBody    = createLoginFormBody(component);
    var cardFooter  = createLoginFormFooter(component);

    cardWrapper.style.width = '380px';
    cardWrapper.classList.add('w3-auto');
    card.classList.add('w3-white', 'w3-round', 'w3-margin-bottom', 'w3-border');

    card.appendChild(cardBody);
    card.appendChild(cardFooter);
    cardWrapper.appendChild(card);

    return cardWrapper;
}

// ── CLASE WCLoginFormView ─────────────────────────────────────────────────────

class WCLoginFormView extends HTMLElement
{
    constructor()
    {
        super();

        this._imgLogo       = null;
        this._pTitle        = null;
        this._inputUsername = null;
        this._inputPassword = null;
        this._btnSubmit     = null;
        this._aRegister     = null;

        this._handleSubmit = this._handleSubmit.bind(this);

        this._render();
    }

connectedCallback()
    {
        if (this._btnSubmit)
        {
            this._btnSubmit.onclick = this._handleSubmit;
        }
    }

  
    _render()
    {
        if (this.childElementCount > 0) return;

        var card = createLoginFormCard(this);
        this.appendChild(card);

        this._imgLogo       = this.querySelector('#login-logo');
        this._pTitle        = this.querySelector('#login-title');
        this._inputUsername = this.querySelector('#login-input-username');
        this._inputPassword = this.querySelector('#login-input-password');
        this._btnSubmit     = this.querySelector('#login-submit-btn');
        this._aRegister     = this.querySelector('#login-register-link');
    }

    _handleSubmit()
    {
        var detail = this.getFormData();

        var customEvent = new CustomEvent('login-submit',
        {
            bubbles:  true,
            composed: true,
            detail:   detail
        });

        this.dispatchEvent(customEvent);
    }
    clearForm()
    {
        if (this._inputUsername) this._inputUsername.value = '';
        if (this._inputPassword) this._inputPassword.value = '';
    }

    getFormData()
    {
        return {
            username: this._inputUsername ? this._inputUsername.value : '',
            password: this._inputPassword ? this._inputPassword.value : ''
        };
    }
}

customElements.define('wc-login-form-view', WCLoginFormView);
