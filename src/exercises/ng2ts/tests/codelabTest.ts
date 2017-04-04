/**
 * In the test it's possible to get access to sourcecode, as well as to the code AST.
 */
import {ts, typescript_intro_Codelab_ts_AST} from '../code';
/**
 * This is a good sample sample of a codelab exercise.
 *
 * An exercise is just a folder with a bunch of files.
 *
 * the configuration is in app/codelab/codelab-config.ts.
 *
 *
 * There are
 *
 */
/**
 * solution/ prefix is used to let the test typechecked.
 * It will be stripped during runtime, and the Codelab module
 * will be loaded.
 */
import {Codelab, evalJs} from '../typescript-intro/Codelab';
declare const polyglot: {t: (s) => any};


const guests = [
  {name: 'me', coming: true},
  {name: 'notme', coming: false},
];

function getConstructorNode(code) {
  let constructorNode = undefined;

  /**
   * Fancy: Require the actual source code, and search in it.
   */
  function findConstructor(node) {
    if (node.kind === ts.SyntaxKind.Constructor) {
      constructorNode = node;
    }
    ts.forEachChild(node, findConstructor);
  }

  findConstructor(code);
  return constructorNode;
}

describe('Component', () => {
  it(polyglot.t(`Create a class called 'Codelab'`), () => {
    /**
     * We can use evalJs to get into the scope of the user's file.
     * Currently evalJs has to be manually added to the `before`
     * section in the file config.
     *
     * I expert the primary use case for eval js would be to remind
     * the user to export something.
     *
     * e.g. if the user created teh class, but haven't exported it this
     * test will still pass.
     */
    chai.expect(typeof evalJs('Codelab')).equals('function');
  });

  it(polyglot.t(`Export the class`), () => {
    /**
     * Require the class, assert it's a function (compile target is es5).
     */
    chai.expect(typeof Codelab).equals('function');
  });

  it(polyglot.t('Add a constructor'), () => {
    let hasConstructor = false;

    /**
     * Fancy: Require the actual source code, and search in it.
     */
    function findConstructor(node) {
      if (node.kind === ts.SyntaxKind.Constructor) {
        hasConstructor = true;
      }
      ts.forEachChild(node, findConstructor);
    }

    findConstructor(typescript_intro_Codelab_ts_AST);

    chai.expect(hasConstructor, polyglot.t(`Codelab doesn't have a constuctor`)).is.true;
  });

  it(polyglot.t(`Make constructor take a parameter 'guests'`), () => {
    const constructorNode = getConstructorNode(typescript_intro_Codelab_ts_AST);

    chai.expect(constructorNode, polyglot.t(`Codelab doesn't have a constuctor`)).to.be.ok;
    chai.expect(constructorNode.parameters.length, polyglot.t(`Codelab's constructor should take a parameter`)).to.equal(1);
    chai.expect(constructorNode.parameters[0].name.text, polyglot.t(`Codelab constructor's parameter should be called 'guests'`)).equals('guests');

    let type = constructorNode.parameters[0].type;
    const isArrayOfGuest = /* Array<Guest> */(type.kind === ts.SyntaxKind.TypeReference && type.typeName.text === 'Array' &&
      type.typeArguments.length === 1 && type.typeArguments[0].typeName.text === 'Guest') ||
      /* Guest[] */ (type.kind === ts.SyntaxKind.ArrayType && type.elementType.kind === ts.SyntaxKind.TypeReference && type.elementType.typeName.text === 'Guest');

    chai.expect(isArrayOfGuest, polyglot.t(`The type for guests should be Array of Guest (hint: Guest[] is one way of doing it.)`)).to.be.ok;
  });

  it(polyglot.t('Make the parameter public (note that now you can access it anywhere in the class using this.guests)'), () => {
    const constructorNode = getConstructorNode(typescript_intro_Codelab_ts_AST);
    let parameter = constructorNode.parameters[0];
    chai.expect(parameter.modifiers.length === 1 && parameter.modifiers[0].kind === ts.SyntaxKind.PublicKeyword,
      polyglot.t(`'guests' constructor parameter should have 'public' visibility.`)).to.be.ok;

  });

  it(polyglot.t(`Create new method 'getGuestsComing'`), () => {
    chai.expect(typeof (new Codelab(guests).getGuestsComing)).equals('function');
  });

  it(polyglot.t(`Modify getGuestsComing to filter the guests array and only return guests with the 'coming' 
      property set to true.`), () => {
    chai.expect(new Codelab(guests).getGuestsComing().length).equals(1);
  });

  /*
   xit(`Let's debug the app! You'll need this if something goes wrong.
   * Open the dev tools in your browser
   * Put in the new method add 'debugger;'
   * The app will stop, and you'll be able to inspect local variables.
   * Get out using F8
   * We can't really test this, so this test is marked as passed
   `, () => {

   });
   */
});
