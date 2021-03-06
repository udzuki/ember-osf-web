import Service from '@ember/service';
import { currentRouteName } from '@ember/test-helpers';
import { ModelInstance } from 'ember-cli-mirage';
import setupMirage from 'ember-cli-mirage/test-support/setup-mirage';
import { percySnapshot } from 'ember-percy';
import { TestContext } from 'ember-test-helpers';
import { module, test } from 'qunit';

import Registration from 'ember-osf-web/models/registration';
import { click, currentURL, visit } from 'ember-osf-web/tests/helpers';
import { loadEngine, setupEngineApplicationTest } from 'ember-osf-web/tests/helpers/engines';

interface OverviewTestContext extends TestContext {
    registration: ModelInstance<Registration>;
}

const KeenStub = Service.extend({
    queryNode(model: any) {
        return {
            result: [{
                'page.info.path': `/${model.id}/foo`,
            }],
        };
    },
});

module('Registries | Acceptance | overview.index', hooks => {
    setupEngineApplicationTest(hooks, 'registries');
    setupMirage(hooks);

    hooks.beforeEach(function(this: OverviewTestContext) {
        server.create('root', { currentUser: null });
        server.loadFixtures('registration-schemas');
        this.set('registration', server.create('registration', {
            registrationSchema: server.schema.registrationSchemas.find('prereg_challenge'),
        }, 'withRegisteredMeta', 'withContributors'));
    });

    test('it renders', async function(this: OverviewTestContext, assert: Assert) {
        await visit(`/${this.registration.id}/`);
        await percySnapshot(assert);

        assert.equal(currentURL(), `/${this.registration.id}/`, 'At the guid URL');
        assert.equal(currentRouteName(), 'registries.overview.index', 'At the expected route');
    });

    test('sidenav links', async function(this: OverviewTestContext, assert: Assert) {
        const analyticsEngine = await loadEngine('analytics-page', 'guid-registration.analytics');

        analyticsEngine.register('service:keen', KeenStub);

        const testCases = [{
            name: 'Comments',
            route: 'registries.overview.comments',
            url: `/--registries/${this.registration.id}/comments`,
        }, {
            name: 'Analytics',
            route: 'guid-registration.analytics.index',
            url: `/--registration/${this.registration.id}/analytics`,
        }, {
            name: 'Components',
            route: 'registries.overview.children',
            url: `/--registries/${this.registration.id}/components`,
        }, {
            name: 'Links',
            route: 'registries.overview.links',
            url: `/--registries/${this.registration.id}/links`,
        }];

        for (const testCase of testCases) {
            await visit(`/${this.registration.id}/`);

            await click(`[data-analytics-name="${testCase.name}"]`);
            await percySnapshot(`Registries sidenav - ${testCase.name}`);

            assert.equal(currentURL(), testCase.url, 'At the correct URL');
            assert.equal(currentRouteName(), testCase.route, 'At the correct route');
        }
    });

    test('sidenav hrefs', async function(this: OverviewTestContext, assert: Assert) {
        const testCases = [{
            selector: '[data-analytics-name="Files"]',
            href: `/${this.registration.id}/files/`,
        }, {
            selector: '[data-analytics-name="Wiki"]',
            href: `/${this.registration.id}/wiki/`,
        }];

        for (const testCase of testCases) {
            await visit(`/${this.registration.id}/`);

            assert.dom(testCase.selector).hasAttribute('href', testCase.href, 'Non-ember routes have the correct href');
        }
    });
});
