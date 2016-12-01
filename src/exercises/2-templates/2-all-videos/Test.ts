import {TestBed} from '@angular/core/testing';
import {AppComponent} from './AppComponent';
import 'initTestBed';
import {appCode} from './code';

beforeEach(() => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({declarations: [AppComponent]});

  TestBed.overrideComponent(AppComponent, {
    set: {
      template: appCode
    }
  });
  TestBed.compileComponents();
});

describe('Blabla', () => {
  it(`AppComponent.ts: When 'search' is called, filter videos with the title matching the search string and assign them to the "videos" property of the component. Use FAKE_VIDEOS as data`, () => {
    let fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.search('itten');
    chai.expect(fixture.componentInstance.videos.length, 'Should have 2 kittens').equals(2);
    fixture.componentInstance.search('cat');
    chai.expect(fixture.componentInstance.videos.length, 'Should have 1 cat').equals(1);
    fixture.componentInstance.search('dog');
    chai.expect(fixture.componentInstance.videos.length, 'Should have no dogs').equals(0);
  });

  it(`app.html: Iterate over the videos, and display a title for each`, () => {
    let fixture = TestBed.createComponent(AppComponent);
    fixture.componentInstance.search('itten');
    fixture.detectChanges();
    chai.expect(fixture.nativeElement.innerHTML).contains(fixture.componentInstance.videos[0].title);
    chai.expect(fixture.nativeElement.innerHTML).contains(fixture.componentInstance.videos[1].title);

    fixture.componentInstance.search('cat');
    fixture.detectChanges();
    chai.expect(fixture.nativeElement.innerHTML).contains(fixture.componentInstance.videos[0].title);
  });

  it(`app.html: Iterate over the videos, and display a thumbnail`, () => {
    let fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    fixture.componentInstance.search('itten');
    fixture.detectChanges();
    const images = fixture.nativeElement.querySelectorAll('img');
    chai.expect(images.length).equals(2);
    chai.expect(images[1].getAttribute('ng-reflect-src')).equals(fixture.componentInstance.videos[1].src);
    chai.expect(images[0].getAttribute('ng-reflect-src')).equals(fixture.componentInstance.videos[0].src);
  });

  // it(`#Bonus app.html: Make hitting enter work in the input trigger the search`, () => {
  //   //TODO
  // });

  it(`#Bonus AppComponent.ts: When the component starts, search for empty string. `, () => {
    let fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const images = fixture.nativeElement.querySelectorAll('img');
    chai.expect(images.length).equals(3);
  });
});

