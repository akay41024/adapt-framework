# babel-plugin-transform-react-templates

> Register react templates with a global function

## Install

Using npm:

```sh
npm install --save-dev babel-plugin-transform-react-templates
```

or using yarn:

```sh
yarn add babel-plugin-transform-react-templates --dev
```

## Usage

Code:
```js
// src/reactTemplateRegister.js

export default register(template, component) {
  templates[template] = component;
}

export const templates = {};

```
With options:
```js
plugins: [
  [
    'transform-react-templates',
    {
      includes: [
        // Any jsx file nested inside a templates folder
        '**/templates/**/*.jsx'
      ],
      importRegisterFunctionFromModule: 'src/reactTemplateRegister.js',
      registerFunctionName: 'register',
      registerTemplateName: (moduleId) => {
        // Use filename as template name
        return path.parse(moduleId).name;
      }
    }
  ]
]
```
