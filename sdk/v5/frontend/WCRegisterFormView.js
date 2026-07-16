// ── FUNCIONES DE CREACIÓN DE ELEMENTOS ───────────────────────────────────────

function createFormField(labelText, inputType, placeholder, fieldName)
{
    var row          = document.createElement('div');
    var label        = document.createElement('label');
    var input        = document.createElement('input');
    var inputWrapper = document.createElement('div');

    input.id          = 'register-input-' + fieldName;
    input.name        = fieldName;
    input.type        = inputType;
    input.placeholder = placeholder;

    row.classList.add('w3-row', 'w3-margin-bottom');
    label.classList.add('w3-col', 'l2');
    inputWrapper.classList.add('w3-col', 'l10');
    input.classList.add('w3-input', 'w3-round', 'w3-border');

    label.textContent = labelText;

    inputWrapper.appendChild(input);
    row.appendChild(label);
    row.appendChild(inputWrapper);

    return row;
}

function createSubmitButton()
{
    var button     = document.createElement('button');
    var icon       = document.createElement('i');
    var buttonText = document.createTextNode(' Registrarse');

    button.id   = 'register-submit-btn';
    button.type = 'button';

    icon.classList.add('fa', 'fa-fw', 'fa-lock');
    button.classList.add('w3-button', 'w3-primary', 'w3-round');

    button.appendChild(icon);
    button.appendChild(buttonText);

    return button;
}

function createRegisterFormHeader()
{
    var header = document.createElement('header');

    header.classList.add('w3-padding-large', 'w3-large', 'w3-border-bottom');
    header.textContent = 'REGISTRO PARA NUEVOS USUARIOS';

    return header;
}

function createRegisterFormBody()
{
    var body = document.createElement('div');
    var form = document.createElement('form');

    var fields =
    [
        { label: 'Nombre',               type: 'text',     placeholder: 'Ingrese su nombre completo',               name: 'nombre'          },
        { label: 'Email',                type: 'email',    placeholder: 'Ingrese su dirección de correo electrónico', name: 'email'           },
        { label: 'Número de Celular',    type: 'tel',      placeholder: 'Ingrese su número de celular',              name: 'celular'         },
        { label: 'Contraseña',           type: 'password', placeholder: 'Ingrese su contraseña',                     name: 'password'        },
        { label: 'Confirmar Contraseña', type: 'password', placeholder: 'Confirmar Contraseña',                      name: 'confirmPassword' }
    ];

    var actionRow      = document.createElement('div');
    var actionColEmpty = document.createElement('div');
    var actionCol      = document.createElement('div');
    var submitButton   = createSubmitButton();

    actionRow.classList.add('w3-row', 'w3-margin-bottom');
    actionColEmpty.classList.add('w3-col', 'l2');
    actionCol.classList.add('w3-col', 'l10');

    for (var i = 0; i < fields.length; i++)
    {
        var field     = fields[i];
        var formField = createFormField(field.label, field.type, field.placeholder, field.name);
        form.appendChild(formField);
    }

    actionCol.appendChild(submitButton);
    actionRow.appendChild(actionColEmpty);
    actionRow.appendChild(actionCol);
    form.appendChild(actionRow);

    body.classList.add('w3-padding-large');
    body.appendChild(form);

    return body;
}

function createRegisterFormCard()
{
    var card   = document.createElement('div');
    var header = createRegisterFormHeader();
    var body   = createRegisterFormBody();

    card.classList.add('w3-white', 'w3-round', 'w3-margin-bottom', 'w3-border');

    card.appendChild(header);
    card.appendChild(body);

    return card;
}

// ── CLASE WCRegisterFormView ──────────────────────────────────────────────────

class WCRegisterFormView extends HTMLElement
{
    constructor()
    {
        super();

        this._card         = null;
        this._form         = null;
        this._submitButton = null;
        this._inputs       = {};

        this._onSubmitClick = this._handleSubmit.bind(this);

        this._render();
    }

    connectedCallback()
    {
        if (this._submitButton)
        {
            this._submitButton.onclick = this._onSubmitClick;
        }
    }

    disconnectedCallback()
    {
        this._detachEventHandlers();
    }

    _render()
    {
        if (this.childElementCount > 0) return;

        this._card = createRegisterFormCard();
        this.appendChild(this._card);

        this._form         = this.querySelector('form');
        this._submitButton = this.querySelector('#register-submit-btn');

        var inputFields = ['nombre', 'email', 'celular', 'password', 'confirmPassword'];
        for (var i = 0; i < inputFields.length; i++)
        {
            var fieldName          = inputFields[i];
            this._inputs[fieldName] = this.querySelector('#register-input-' + fieldName);
        }
    }

    

    _handleSubmit(event)
    {
        var detail = {};
        var keys   = Object.keys(this._inputs);
        for (var i = 0; i < keys.length; i++)
        {
            var key    = keys[i];
            detail[key] = this._inputs[key].value;
        }

        var customEvent = new CustomEvent('register-submit',
        {
            bubbles:  true,
            composed: true,
            detail:   detail
        });

        this.dispatchEvent(customEvent);
    }

    clearForm()
    {
        var keys = Object.keys(this._inputs);
        for (var i = 0; i < keys.length; i++)
        {
            var key            = keys[i];
            this._inputs[key].value = '';
        }
    }

    getFormData()
    {
        var data = {};
        var keys = Object.keys(this._inputs);
        for (var i = 0; i < keys.length; i++)
        {
            var key  = keys[i];
            data[key] = this._inputs[key].value;
        }
        return data;
    }
}

customElements.define('wc-register-form-view', WCRegisterFormView);
