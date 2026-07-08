class WCRegisterFormView extends HTMLElement
{
    constructor()
    {
        super();
    }

    connectedCallback()
    {
        this.innerHTML = `
            <div class="w3-white w3-round w3-margin-bottom w3-border">

                <header class="w3-padding-large w3-large w3-border-bottom"
                    style="font-weight: 500">HORIZONTAL FORM</header>

                <div class="w3-padding-large">

                    <div class="w3-row w3-margin-bottom">
                        <label class="w3-col l2">Name</label>
                        <div class="w3-col l10">
                            <input id="wc-reg-name" type="text"
                                class="w3-input w3-border w3-round"
                                placeholder="Enter Your Name">
                        </div>
                    </div>

                    <div class="w3-row w3-margin-bottom">
                        <label class="w3-col l2">Email</label>
                        <div class="w3-col l10">
                            <input id="wc-reg-email" type="text"
                                class="w3-input w3-border w3-round"
                                placeholder="Enter Your Email Address">
                        </div>
                    </div>

                    <div class="w3-row w3-margin-bottom">
                        <label class="w3-col l2">Mobile Number</label>
                        <div class="w3-col l10">
                            <input id="wc-reg-mobile" type="text"
                                class="w3-input w3-border w3-round"
                                placeholder="Enter Your Mobile Number">
                        </div>
                    </div>

                    <div class="w3-row w3-margin-bottom">
                        <label class="w3-col l2">Password</label>
                        <div class="w3-col l10">
                            <input id="wc-reg-password" type="password"
                                class="w3-input w3-border w3-round"
                                placeholder="Enter Password">
                        </div>
                    </div>

                    <div class="w3-row w3-margin-bottom">
                        <label class="w3-col l2">Confirm Password</label>
                        <div class="w3-col l10">
                            <input id="wc-reg-confirm" type="password"
                                class="w3-input w3-border w3-round"
                                placeholder="Confirm Password">
                        </div>
                    </div>

                    <div class="w3-row w3-margin-bottom">
                        <div class="w3-col l2">&nbsp;</div>
                        <div class="w3-col l10">
                            <label>
                                <input type="checkbox" class="w3-check" checked>
                                I Agree Terms &amp; Conditions
                            </label>
                        </div>
                    </div>

                    <div class="w3-row w3-margin-bottom">
                        <div class="w3-col l2">&nbsp;</div>
                        <div class="w3-col l10">
                            <button id="wc-reg-btn" type="button"
                                class="w3-button w3-primary w3-round">
                                <i class="fa fa-fw fa-lock"></i> Register
                            </button>
                        </div>
                    </div>

                    <p id="wc-reg-result"></p>

                </div>
            </div>
        `;

        this.querySelector('#wc-reg-btn').addEventListener('click', function()
        {
            const username = document.getElementById('wc-reg-name').value;
            const password = document.getElementById('wc-reg-password').value;
            const confirm  = document.getElementById('wc-reg-confirm').value;

            if (!username || !password)
            {
                document.getElementById('wc-reg-result').textContent = 'Completá los campos requeridos.';
                return;
            }

            if (password !== confirm)
            {
                document.getElementById('wc-reg-result').textContent = 'Las contraseñas no coinciden.';
                return;
            }

            document.dispatchEvent(new CustomEvent('wc-register-submit',
            {
                detail: { username, password }
            }));
        });
    }
}

customElements.define('wc-register-form-view', WCRegisterFormView);
