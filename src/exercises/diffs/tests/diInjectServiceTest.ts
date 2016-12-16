import {TestBed} from "@angular/core/testing";
import "initTestBed";
import {AppComponent} from "../app.component";
import {VideoService} from "../video/video.service";
import {AppModule} from "../app.module";
import {app_html, app_component_ts} from "../code";


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
  it(`VideoService.ts: Add @Injectable() decorator to the class.`, () => {
    let metadata;
    try {
      metadata = Reflect.getMetadata("parameters", VideoService);
    } catch (e) {
      // Do nothing, we have assertions below for this case
    }
    chai.expect(metadata).not.undefined;
  });
  it(`Appmodule.ts: Add VideoService to the module providers`, () => {
    let metadata;
    try {
      metadata = Reflect.getMetadata("annotations", AppModule);
    } catch (e) {
      // Do nothing, we have assertions below for this case
    }
    chai.expect(metadata[0].providers[0]).equals(VideoService);
  });

  it(`AppComponent.ts: Require videoService in the component`, () => {
    chai.expect(AppComponent.length, `App component constructor doesn't take any parameters`).to.equal(1);
    chai.expect(app_component_ts).matches(/VideoService/)
  });

  it(`AppComponent.ts: return videoService.search(results instead of fake data)`, () => {
    let fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.search('itten');
    chai.expect(fixture.componentInstance.videos.length).to.equal(4);
  });


});

