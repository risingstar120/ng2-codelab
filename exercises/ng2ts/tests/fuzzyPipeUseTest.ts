declare const polyglot: {t: (s) => any};
import {TestBed} from '@angular/core/testing';
import 'initTestBed';
import {AppComponent} from '../app.component';
import {
  app_html,
  video_video_html,
  toggle_panel_toggle_panel_html,
  context_context_html,
  thumbs_thumbs_html
} from '../code';
import {AppModule} from '../app.module';
import {VideoComponent} from '../video/video.component';
import {VideoService} from '../video/video.service';
import {TogglePanelComponent} from '../toggle-panel/toggle-panel.component';
import {ContextComponent} from '../context/context.component';
import {ContextService} from '../context/context.service';
import {Api} from '../api.service';
import {FuzzyPipe} from '../fuzzy-pipe/fuzzy.pipe';
import {ThumbsComponent} from '../thumbs/thumbs.component';

const sampleVideo = Api.fetch('')[0];

beforeEach(() => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [VideoService, ContextService, /* that's a hack, to provide parent component */ VideoComponent],
    declarations: [AppComponent, VideoComponent, ThumbsComponent, TogglePanelComponent, ContextComponent, FuzzyPipe]
  });
  TestBed.overrideComponent(AppComponent, {set: {template: app_html}});
  TestBed.overrideComponent(VideoComponent, {set: {template: video_video_html}});
  TestBed.overrideComponent(ThumbsComponent, {set: {template: thumbs_thumbs_html}});
  TestBed.overrideComponent(TogglePanelComponent, {set: {template: toggle_panel_toggle_panel_html}});
  TestBed.overrideComponent(ContextComponent, {set: {template: context_context_html}});
  TestBed.compileComponents();
});
function sampleFuzzy(value) {
  let date = new Date(value);
  let dateNow = new Date();
  let millisecondsDifference = dateNow.getTime() - date.getTime();
  let differenceDays = Math.floor(millisecondsDifference / (1000 * 3600 * 24));

  return differenceDays + ' ' + polyglot.t('days');
}

describe('Pipes', () => {


  it(polyglot.t(`AppModule: Add the FuzzyPipe to the AppModule declarations`), () => {
    let metadata;
    try {
      metadata = Reflect.getMetadata('annotations', AppModule);
    } catch (e) {
      // Do nothing, we have assertions below for this case
    }
    chai.expect(metadata[0].declarations, `Fuzzy pipe not found`).contains(FuzzyPipe);
  });

  it(polyglot.t(`video.html: Use the pipe on the date.`), () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('button').click();
    fixture.detectChanges();
    chai.expect(fixture.nativeElement.querySelector('my-video').innerHTML).contains(sampleFuzzy(sampleVideo.date));
  });
});

