import {Injectable} from '@angular/core';
import {Observable, BehaviorSubject} from 'rxjs/Rx';
import {AppState, AppConfig} from './codelab-config';
import {Action} from '../action';
import {ActionTypes} from '../action-types.enum';
import {ExerciseConfig} from './exercise-config';
import {MilestoneConfig} from './milestone-config';
import {ReducersService} from '../reducers.service';
import {assert} from '../utils';
import {FileConfig} from './file-config';
import {CodelabConfigService} from '../../exercises/codelab-config-service';
import {testMiddleware} from '../middleware/test.middleware';
import {AppConfigService} from '../app-config.service';


export function selectedMilestone(state: AppState): MilestoneConfig {
  return assert(state.codelab.milestones[state.codelab.selectedMilestoneIndex]);
}
export function selectedExercise(state: AppState): ExerciseConfig {
  const milestone = selectedMilestone(state);
  return assert(milestone.exercises[milestone.selectedExerciseIndex]);
}

export type Middleware = (CodelabConfig, any) => AppState;

@Injectable()
export class StateService {
  public readonly update: Observable<AppState>;
  private readonly dispatch: BehaviorSubject<Action>;
  public appConfig: AppConfig;
  public readonly version = 4;

  middleware: Middleware[] = [];

  applyMiddleware(state, action) {
    return this.middleware.reduce((state, middleware) => middleware(state, action), state);
  }

  constructor(private reducers: ReducersService, codelabConfig: CodelabConfigService, appConfig: AppConfigService) {
    this.dispatch = new BehaviorSubject<Action>({
      type: ActionTypes.IGNORE,
      data: {}
    });

    this.dispatch.next({
      type: ActionTypes.INIT_STATE,
      data: {}
    });

    this.addMiddleware(testMiddleware(this, appConfig.config));
    this.appConfig = appConfig.config;
    this.update = this.dispatch
      .mergeScan<Action, AppState>((state: AppState, action: Action): any => {
        try {
          if (reducers[action.type]) {
            const result = this.applyMiddleware(reducers[action.type](state, action), action);
            return result instanceof Observable ? result : Observable.of(result);
          }
          if (!state) {
            debugger
          }
        }
        catch (e) {
          debugger
        }
        return this.applyMiddleware(state, action);
      }, {
        codelab: undefined,
        codelabs: codelabConfig.codelabs,
        local: {
          runId: 0,
          page: 'milestone',
          autorun: false,
          running: false,
          user: '',
          auth: {}
        },
        config: appConfig.config,
        version: this.version
      })
      .map((state: AppState) => {
        localStorage.setItem('state', JSON.stringify(state));
        return state;
      })
      .publishReplay(1)
      .refCount();

    this.update.subscribe(() => {
      //console.log('next');
    }, (error) => {
      console.log(error);
      debugger
    });

  }

  public addMiddleware(middleware: Middleware) {
    this.middleware.push(middleware);
  }

  private dispatchAction(actionType: ActionTypes, data?) {
    this.dispatch.next({
        type: actionType,
        data: data === undefined ? {} : data
      },
    );
  }

  selectMilestone(index: number) {
    this.dispatchAction(ActionTypes.SELECT_MILESTONE, index);
  }

  selectExercise(index: number) {
    this.dispatchAction(ActionTypes.SELECT_EXERCISE, index);
  }

  nextExercise() {
    this.dispatchAction(ActionTypes.NEXT_EXERCISE);
  }

  toggleAutorun() {
    this.dispatchAction(ActionTypes.TOGGLE_AUTORUN);
  }

  setAuth(auth) {
    this.dispatchAction(ActionTypes.SET_AUTH, auth);
  }

  simulateState(state) {
    this.dispatchAction(ActionTypes.SIMULATE_STATE, state);
  }

  updateCode(changes) {
    this.dispatchAction(ActionTypes.UPDATE_CODE, changes);
  }

  sendFeedback(feedback) {
    this.dispatchAction(ActionTypes.SEND_FEEDBACK, feedback);
  }

  setTestList(tests: Array<any>) {
    this.dispatchAction(ActionTypes.SET_TEST_LIST, tests);
  }

  updateSingleTestResult(test: any) {
    this.dispatchAction(ActionTypes.UPDATE_SINGLE_TEST_RESULT, test);
  }

  run() {
    this.dispatchAction(ActionTypes.RUN_CODE);
  }

  toggleFile(file: FileConfig) {
    this.dispatchAction(ActionTypes.TOGGLE_FILE, file);
  }

  loadSolutions() {
    this.dispatchAction(ActionTypes.LOAD_ALL_SOLUTIONS);
  }

  endTests() {
    this.dispatchAction(ActionTypes.END_TESTS);
  }

  selectCodelab(codelabId: string) {
    this.dispatchAction(ActionTypes.SELECT_CODELAB, codelabId);
  }
}
