import { CodelabPage } from './app.po';

describe('codelab App', function() {
  let page: CodelabPage;

  beforeEach(() => {
    page = new CodelabPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();

    expect(page.getMilestoneText()).toEqual('1');
  });
});
