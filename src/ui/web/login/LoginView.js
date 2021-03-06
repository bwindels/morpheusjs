/*
Copyright 2020 Bruno Windels <bruno@windels.cloud>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import {TemplateView} from "../general/TemplateView.js";
import {brawlGithubLink} from "./common.js";
import {SessionLoadView} from "./SessionLoadView.js";

export class LoginView extends TemplateView {
    render(t, vm) {
        const disabled = vm => !!vm.isBusy;
        const username = t.input({type: "text", placeholder: vm.i18n`Username`, disabled});
        const password = t.input({type: "password", placeholder: vm.i18n`Password`, disabled});
        const homeserver = t.input({type: "text", placeholder: vm.i18n`Your matrix homeserver`, value: vm.defaultHomeServer, disabled});
        return t.div({className: "LoginView form"}, [
            t.h1([vm.i18n`Log in to your homeserver`]),
            t.if(vm => vm.error, t.createTemplate(t => t.div({className: "error"}, vm => vm.error))),
            t.div(username),
            t.div(password),
            t.div(homeserver),
            t.div(t.button({
                onClick: () => vm.login(username.value, password.value, homeserver.value),
                disabled
            }, vm.i18n`Log In`)),
            t.div(t.button({onClick: () => vm.cancel(), disabled}, [vm.i18n`Pick an existing session`])),
            t.mapView(vm => vm.loadViewModel, loadViewModel => loadViewModel ? new SessionLoadView(loadViewModel) : null),
            t.p(brawlGithubLink(t))
        ]);
    }
}

