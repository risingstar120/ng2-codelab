import {Pipe, PipeTransform} from '@angular/core';
/*d:fuzzyPipeCreateSolved*/
@Pipe({name: 'fuzzy'})
export class FuzzyPipe implements PipeTransform {
  transform(value: string) {
    let date = new Date(value);
    let dateNow = new Date();

    let millisecondsDifference = dateNow.getTime() - date.getTime();
    let differenceDays = Math.floor(millisecondsDifference / (1000 * 3600 * 24));
    let differenceYears = Math.floor(differenceDays / 365);

    if (differenceDays < 365) {
      return differenceDays + ' ' + polyglot.t('days');
    }
    return differenceYears + ' ' + polyglot.t('years ago');
  }
}
/*/d*//*d:neverShow*/
// Please ignore
export function evalJs(string) {
  return string;
}
/*/d*/
