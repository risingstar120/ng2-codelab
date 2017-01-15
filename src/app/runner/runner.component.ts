import {Component, ElementRef, ViewChild, AfterViewInit, Input, ChangeDetectorRef} from '@angular/core';
import * as ts from 'typescript';
import {FileConfig} from '../file-config';
import {StateService} from '../state.service';
import {LoopProtectionService} from '../loop-protection.service';
import {ScriptLoaderService} from '../script-loader.service';
import {Subscription} from 'rxjs';
import {AppConfigService} from '../app-config.service';

let cachedIframes = {};

function jsInjector(iframe) {
  return function (script) {
    iframe.contentWindow.eval(script);
  }
}
function jsScriptInjector(iframe) {
  return function (code) {
    const script = document.createElement('script');
    script.type = "text/javascript";
    script.innerHTML = code;
    iframe.contentWindow.document.head.appendChild(script);
  }
}


function cssInjector(iframe) {
  return function (css) {
    const s = iframe.contentDocument.createElement("style");
    s.innerHTML = css;
    iframe.contentDocument.getElementsByTagName("head")[0].appendChild(s);
  }
}

interface IframeConfig {
  id: string,
  url: string,
  restart?: boolean,
  hidden?: boolean
}


function createIframe(config: IframeConfig) {
  const iframe = document.createElement('iframe');
  iframe.setAttribute('sandbox', 'allow-modals allow-forms allow-pointer-lock allow-popups allow-same-origin allow-scripts');
  iframe.setAttribute('frameBorder', '0');
  iframe.setAttribute('src', config.url);
  iframe.setAttribute('class', config.id);
  iframe.setAttribute('style', 'width: 500px; height: 100%');
  return iframe;
}

function injectIframe(element: any, config: IframeConfig, runner: RunnerComponent): Promise<{setHtml: Function, runMultipleFiles: Function, runSingleScriptFile: Function}> {
  if (cachedIframes[config.id]) {
    cachedIframes[config.id].remove();
    delete cachedIframes[config.id];
  }

  const iframe = createIframe(config);
  cachedIframes[config.id] = iframe;
  element.appendChild(iframe);
  const runJs = jsInjector(iframe);
  let index = 0;

  return new Promise((resolve, reject) => {
    if (!iframe.contentWindow) {
      return reject('iframe is gone');
    }
    iframe.contentWindow.onload = () => {
      iframe.contentWindow.console.log = function () {
        console.log.apply(console, arguments);
      };

      const setHtml = (html) => {
        iframe.contentDocument.body.innerHTML = html;
      };
      const displayError = (error, info) => {
        if (!runner.appConfig.config.noerrors) {
          console.log(info, error);
        }
        const escaped = (document.createElement('a').appendChild(
          document.createTextNode(error)).parentNode as any).innerHTML;
        setHtml(`
            <div style = "border-top: 1px #888 dotted; padding-top: 4px; margin-top: 4px">Check out your browser console to see the full error!</div>
            <pre>${escaped}</pre>`);
      };

      iframe.contentWindow.console.error = function (error, message) {
        // handle angular error 1/3
        displayError(error, 'Angular Error');
      };

      resolve({
        runSingleScriptFile: jsScriptInjector(iframe),
        runSingleFile: runJs,
        setHtml: setHtml,
        runMultipleFiles: (files: Array<FileConfig>) => {
          index++;

          (iframe.contentWindow as any).System.register('code', [], function (exports) {
            return {
              setters: [],
              execute: function () {
                exports('ts', ts);
                files.forEach((file) => {
                  exports(file.path.replace(/[\/\.-]/gi, '_'), file.code);
                  exports(file.path.replace(/[\/\.-]/gi, '_') + '_AST', ts.createSourceFile(file.path, file.code, ts.ScriptTarget.ES5));
                });
              }
            }
          });

          files.map(file => {
            if (!file.path) {
              debugger
            }
          });

          files.filter(file => file.path.indexOf('index.html') >= 0).map((file => {
            setHtml(file.code)
          }));

          files.filter(file => file.type === 'typescript').map((file) => {
            // Update module names
            let code = file.code;

            code = runner.loopProtectionService.protect(file.path, code);

            if (file.before) {
              code = file.before + ';\n' + code;
            }

            if (file.after) {
              code = ';\n' + code + file.after;
            }


            const moduleName = file.moduleName;
            const time = (new Date()).getTime();
            console.log('TRANSPILE START');

            // TODO(kirjs): Add source maps.
            const result =  ts.transpileModule(code, {
              compilerOptions: {
                module: ts.ModuleKind.System,
                target: ts.ScriptTarget.ES5,
                experimentalDecorators: true,
                emitDecoratorMetadata: true,
                noImplicitAny: true,
                declaration: true,
                // TODO: figure out why this doesn't work
                inlineSourceMap: true,
                inlineSources: true,
                sourceMap: true
              },
              fileName: moduleName,
              moduleName: moduleName,
              reportDiagnostics: true
            });
            console.log('TRANSPILE DONE', (new Date()).getTime() - time);

            return result;
          }).map((compiled) => {
            runJs(compiled.outputText);
          });


          files.filter((file) => file.bootstrap).map((file) => {
            const moduleName = file.moduleName;
            runJs(`System.import('${moduleName}')`);
          });
        }
      });
    }
  });
}


@Component({
  selector: 'app-runner',
  templateUrl: './runner.component.html',
  styleUrls: ['./runner.component.css']
})
export class RunnerComponent implements AfterViewInit {
  @Input() files: Array<FileConfig>;
  @Input() runnerType: string;
  html = `<my-app></my-app>`;
  @ViewChild('runner') element: ElementRef;
  private stateSubscription: Subscription;


  constructor(private changeDetectionRef: ChangeDetectorRef, private state: StateService, public loopProtectionService: LoopProtectionService, public scriptLoaderService: ScriptLoaderService, public appConfig: AppConfigService) {
    window.addEventListener("message", (event) => {
      if (!event.data || !event.data.type) {
        return;
      }

      if (event.data.type === 'testList') {
        state.setTestList(event.data.tests);

      }
      if (event.data.type === 'testResult') {
        state.updateSingleTestResult({
          title: event.data.test.title,
          pass: event.data.pass,
          result: event.data.result
        });
      }
      changeDetectionRef.detectChanges();
    }, false);
  }

  runCode() {

    const time = (new Date()).getTime();
    console.log('FRAME START');
    if (this.runnerType === 'typescript') {
      injectIframe(this.element.nativeElement, {
        id: 'preview', 'url': 'assets/runner/blank.html'
      }, this).then((sandbox) => {
        sandbox.runSingleScriptFile(this.scriptLoaderService.getScript('SystemJS'));
        sandbox.runMultipleFiles(this.files.filter(file => !file.test));
      });

      injectIframe(this.element.nativeElement, {
        id: 'testing', 'url': 'assets/runner/blank.html'
      }, this).then((sandbox) => {
        console.log('FRAME CREATED', (new Date()).getTime() - time);
        sandbox.runSingleScriptFile(this.scriptLoaderService.getScript('SystemJS'));
        sandbox.runSingleScriptFile(this.scriptLoaderService.getScript('mocha'));
        sandbox.runSingleScriptFile(this.scriptLoaderService.getScript('chai'));
        sandbox.runSingleScriptFile(this.scriptLoaderService.getScript('test-bootstrap'));

        const testFiles = this.files
          .filter(file => !file.excludeFromTesting);
        sandbox.runMultipleFiles(testFiles);
      });
    } else {
      injectIframe(this.element.nativeElement, {
        id: 'preview', 'url': 'assets/runner/index.html'
      }, this).then((sandbox) => {
        sandbox.setHtml(this.html);
        sandbox.runMultipleFiles(this.files.filter(file => !file.test));
      });

      injectIframe(this.element.nativeElement, {
        id: 'testing', 'url': 'assets/runner/tests.html', restart: true, hidden: false
      }, this)
        .then((sandbox) => {

          const testFiles = this.files
            .filter(file => !file.excludeFromTesting);
          sandbox.runMultipleFiles(testFiles);
        });
    }
  }

  ngAfterViewInit() {
    this.state.update
      .map(e => e.local.runId)
      .distinctUntilChanged()
      .subscribe(() => {
        this.runCode()
      }, () => {
        debugger
      });
  }

}


