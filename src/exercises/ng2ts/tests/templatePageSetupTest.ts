declare const polyglot: {t: (s)=>any};
import {TestBed} from '@angular/core/testing';
import {AppComponent} from '../app.component';
import 'initTestBed';
import {app_html} from '../code';

beforeEach(() => {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({declarations: [AppComponent]});

  TestBed.overrideComponent(AppComponent, {
    set: {
      template: app_html
    }
  });
  TestBed.compileComponents();
});

describe('Blabla', () => {
  it(polyglot.t(`app.html: Add a <h1> header, display the 'title' property of the AppComponent inside`), () => {
    let fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const header = fixture.nativeElement.querySelector('h1');
    chai.expect(header, `Can't find any h1 headers`).is.not.null;
    chai.expect(header.innerHTML).contains('CatTube');
    fixture.componentInstance.title = 'SomethingElse';
    fixture.detectChanges();

    const header2 = fixture.nativeElement.querySelector('h1');
    chai.expect(header2.innerHTML, `Use the curly braces to put component title property in the header`).contains('SomethingElse');
  });

  it(polyglot.t(`app.html: Add an <input> with a 'placeholder' set to 'video' (hint: 'placeholder' is just an attribute of an input tag) `), () => {
    let fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input');
    chai.expect(input, `Can't find any inputs`).is.not.null;
    chai.expect(input.placeholder, `Input placeholder should contain word 'video'`).contains('video');
  });

  it(polyglot.t(`app.html: Add a <button> labeled 'search'`), () => {
    let fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    chai.expect(button, `Can't find any buttons`).is.not.null;
    chai.expect(button.innerHTML.toLowerCase()).contains('search')
  });


});

