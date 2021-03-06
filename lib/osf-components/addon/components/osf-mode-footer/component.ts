import { service } from '@ember-decorators/service';
import Component from '@ember/component';
import config from 'ember-get-config';

import { layout } from 'ember-osf-web/decorators/component';
import Analytics from 'ember-osf-web/services/analytics';
import styles from './styles';
import template from './template';

/**
 * @module ember-osf-web
 * @submodule components
 */

/**
 * If development mode, display a red banner in the footer
 *
 * TODO: move to a 'dev-tools' in-repo addon or package, exclude from prod builds
 *
 * @class osf-mode-footer
 */
@layout(template, styles)
export default class OsfModeFooter extends Component {
    @service analytics!: Analytics;

    isDevMode: boolean = config.OSF.devMode;
    showModal: boolean = false;
}
