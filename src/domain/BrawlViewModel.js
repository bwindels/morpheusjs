import {SessionViewModel} from "./session/SessionViewModel.js";
import {LoginViewModel} from "./LoginViewModel.js";
import {SessionPickerViewModel} from "./SessionPickerViewModel.js";
import {ViewModel} from "./ViewModel.js";

export class BrawlViewModel extends ViewModel {
    constructor(options) {
        super(options);
        const {createSessionContainer, sessionInfoStorage, storageFactory} = options;
        this._createSessionContainer = createSessionContainer;
        this._sessionInfoStorage = sessionInfoStorage;
        this._storageFactory = storageFactory;

        this._error = null;
        this._sessionViewModel = null;
        this._loginViewModel = null;
        this._sessionPickerViewModel = null;

        this._sessionContainer = null;
        this._sessionCallback = this._sessionCallback.bind(this);
    }

    async load() {
        if (await this._sessionInfoStorage.hasAnySession()) {
            this._showPicker();
        } else {
            this._showLogin();
        }
    }

    _sessionCallback(sessionContainer) {
        if (sessionContainer) {
            this._setSection(() => {
                this._sessionContainer = sessionContainer;
                this._sessionViewModel = new SessionViewModel(this.childOptions({sessionContainer}));
            });
        } else {
            // switch between picker and login
            if (this.activeSection === "login") {
                this._showPicker();
            } else {
                this._showLogin();
            }
        }
    }

    async _showPicker() {
        this._setSection(() => {
            this._sessionPickerViewModel = new SessionPickerViewModel({
                sessionInfoStorage: this._sessionInfoStorage,
                storageFactory: this._storageFactory,
                createSessionContainer: this._createSessionContainer,
                sessionCallback: this._sessionCallback,
            });
        });
        try {
            await this._sessionPickerViewModel.load();
        } catch (err) {
            this._setSection(() => this._error = err);
        }
    }

    _showLogin() {
        this._setSection(() => {
            this._loginViewModel = new LoginViewModel({
                defaultHomeServer: "https://matrix.org",
                createSessionContainer: this._createSessionContainer,
                sessionCallback: this._sessionCallback,
            });
        })

    }

    get activeSection() {
        if (this._error) {
            return "error";
        } else if (this._sessionViewModel) {
            return "session";
        } else if (this._loginViewModel) {
            return "login";
        } else {
            return "picker";
        }
    }

    _setSection(setter) {
        // clear all members the activeSection depends on
        this._error = null;
        this._sessionViewModel = null;
        this._loginViewModel = null;
        this._sessionPickerViewModel = null;

        if (this._sessionContainer) {
            this._sessionContainer.stop();
            this._sessionContainer = null;
        }
        // now set it again
        setter();
        this.emitChange("activeSection");
    }

    get error() { return this._error; }
    get sessionViewModel() { return this._sessionViewModel; }
    get loginViewModel() { return this._loginViewModel; }
    get sessionPickerViewModel() { return this._sessionPickerViewModel; }
}
