class WCLoginFormView extends HTMLElement
{
    constructor()
    {
        super();
    }

    connectedCallback()
    {
        this.innerHTML = `
            <div class="w3-padding-32">
                <div class="w3-auto" style="width:380px">
                    <div class="w3-white w3-round w3-margin-bottom w3-border">
                        <div class="w3-padding-large">

                            <div class="w3-center w3-padding-16">
                                <p>SIGN IN</p>
                            </div>

                            <div class="w3-margin-bottom">
                                <input id="wc-login-username" type="text"
                                    class="w3-input w3-round w3-border"
                                    placeholder="Enter Username">
                            </div>

                            <div class="w3-margin-bottom">
                                <input id="wc-login-password" type="password"
                                    class="w3-input w3-round w3-border"
                                    placeholder="Enter Password">
                            </div>

                            <div class="w3-margin-bottom">
                                <div>
                                    <input id="wc-login-checkbox" class="w3-check" type="checkbox" checked>
                                    <label for="wc-login-checkbox">I AGREE WITH TERMS &amp; CONDITIONS</label>
                                </div>
                            </div>

                            <button id="wc-login-btn" type="button"
                                class="w3-button w3-round w3-margin-bottom w3-primary w3-block">
                                Sign In
                            </button>

                            <p id="wc-login-result"></p>

                        </div>

                        <div class="w3-center w3-border-top">
                            <p class="w3-margin">
                                <span>Do not have an account?</span>
                                <a href="register.html"> Sign Up here</a>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.querySelector('#wc-login-btn').addEventListener('click', function()
        {
            const username = document.getElementById('wc-login-username').value;
            const password = document.getElementById('wc-login-password').value;

            if (!username || !password)
            {
                document.getElementById('wc-login-result').textContent = 'Completá usuario y contraseña.';
                return;
            }

            document.dispatchEvent(new CustomEvent('wc-login-submit',
            {
                detail: { username, password }
            }));
        });
    }
}

customElements.define('wc-login-form-view', WCLoginFormView);
