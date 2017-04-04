declare const polyglot: {t: (s)=>any};
import {TestBed} from '@angular/core/testing';
import 'initTestBed';
import {AppComponent} from '../app.component';
import {VideoService} from '../video/video.service';
import {AppModule} from '../app.module';
import {app_html, app_component_ts} from '../code';


beforeEach(() => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [VideoService],
    declarations: [AppComponent]
  });
  TestBed.overrideComponent(AppComponent, {
    set: {
      template: app_html
    }
  });
  TestBed.compileComponents();
});

describe('Blabla', () => {
  it(polyglot.t(`VideoService.ts: Add @Injectable() decorator to the classs`), () => {
    let metadata;
    try {
      metadata = Reflect.getMetadata('design:paramtypes', VideoService);
    } catch (e) {
      // Do nothing, we have assertions below for this case
    }
    chai.expect(metadata).not.undefined;
  });
  it(polyglot.t(`Appmodule.ts: Add VideoService to the NgModule providers property`), () => {
    let metadata;
    try {
      metadata = Reflect.getMetadata('annotations', AppModule);
    } catch (e) {
      // Do nothing, we have assertions below for this case
    }
    chai.expect(metadata[0].providers[0]).equals(VideoService);
  });

  it(polyglot.t(`AppComponent.ts: Inject videoService in the component constructor`), () => {
    chai.expect(AppComponent.length, `App component constructor doesn't take any parameters`).to.equal(1);
    chai.expect(app_component_ts).matches(/VideoService/)
  });

  it(polyglot.t(`AppComponent.ts: When searching assign videoService.search results to the videos property of the class`), () => {
    let fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.search('itten');
    chai.expect(fixture.componentInstance.videos.length).to.equal(4);
  });


});

