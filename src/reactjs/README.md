---
sidebar: auto
---

# To-Do App

## Introduction
[React](https://reactjs.org/) is a front-end JavaScript library that can be used to create interactive user interfaces for your application.

In this tutorial, you will create a to-do application. Your application will need to display the tasks, add new tasks, mark tasks as complete, and remove tasks. These actions will touch upon the four aspects of a [CRUD (Create, Read, Update, and Delete)](https://en.wikipedia.org/wiki/Create,_read,_update_and_delete) application.

This type of project is often accomplished with Class components, but this application will instead integrate [React Hooks](https://reactjs.org/docs/hooks-intro.html). React Hooks allow for functional components to have a state and use lifecycle methods, allowing you to avoid using Class components and have more modular and readable code.

You can check out [the completed project on CodeSandbox](https://codesandbox.io/s/oj3qm2zq06).

## Prerequisites
To complete this tutorial, you will need:

- Node.js installed locally, which you can do by following [How to Install Node.js and Create a Local Development Environment](https://www.digitalocean.com/community/tutorial_series/how-to-install-node-js-and-create-a-local-development-environment).
- Some familiarity with React will be beneficial, but is not required. You can take a look at our [How To Code in React.js](https://www.digitalocean.com/community/tutorial_series/how-to-code-in-react-js) series.

## Step 1 — Starting a React App
First, you need to create a new app. In your terminal window, navigate to the place you would like your new application to be located and type:

```bash
npx create-react-app react-to-do
```

:::warning
Note: Prior to React 16.8, you would have had to install the alpha build of React 16.7 to utilize React Hooks. At the time of this writing, Create React App will install the latest stable version of React (16.13.1) which supports Hooks.
:::

Next, navigate into the new project directory:

```bash
cd react-to-do
```
 
Then, run the project:
```bash
npm start
 ```
Navigate to `localhost:3000` in your browser to see the spinning React logo.

Your application has now been set-up and you can continue on to building the rest of the app.

## Step 2 — Styling Your Application
Styling will not be the focus of this tutorial, but it will help display the to-do tasks.

Open `App.css` in your code editor:
```bash
nano src/App.css
 ```
Replace the content of this file with the three classes you will be using throughout your app:
``` css [src/App.css]
.app {
  background: #209cee;
  height: 100vh;
  padding: 30px;
}

.todo-list {
  background: #e8e8e8;
  border-radius: 4px;
  max-width: 400px;
  padding: 5px;
}

.todo {
  align-items: center;
  background: #fff;
  border-radius: 3px;
  box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.15);
  display: flex;
  font-size: 12px;
  justify-content: space-between;
  margin-bottom: 6px;
  padding: 3px 10px;
}
```
This creates CSS classes for `app`, `todo-list`, and `todo`. It takes advantage of `vh` (viewport height) units and `flexbox` properties (`align-items` and `justify-content`).

Styling is complete. Now, you can implement the aspects of CRUD.

## Step 3 — Reading To-Do Items
Let’s start on the Read part of CRUD. You will want to make a list of things so that you can read and view the list.

A to-do application using classes would resemble something like this:
``` js
class App extends Component {
  state = {
    todos: [
      { text: "Learn about React" },
      { text: "Meet friend for lunch" },
      { text: "Build really cool todo app" }
    ]
  }

  setTodos = todos => this.setState({ todos });

  render() {
    return <div></div>
  }
}
```
You are going to be using React Hooks, so state will look a little different than if you used classes.

Open `App.js`:
```bash
nano src/App.js
```
Modify this file to add the following lines code to `App` component:

``` js [src/App.js]
import React from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [todos, setTodos] = React.useState([
    { text: "Learn about React" },
    { text: "Meet friend for lunch" },
    { text: "Build really cool todo app" }
  ]);

  return (
    // ...
  );
}

export default App;
```
The component is a functional component. In past versions of React, functional components were unable to handle state, but now, by using Hooks, they can.

- The first parameter, `todos`, is what you are going to name your state.
- The second parameter, `setTodos`, is what you are going to use to set the state.

The hook of `useState` is what React uses to hook into the state or lifecycle of the component. You will then create an array of objects and you will have the beginnings of your state.

You will want to create a component that you can use later on in the `return` of the main `App` component. You will call that `Todo` and it will pass in the `todo` and show the `text` part of the todo (`todo.text`).

Revisit `App.js` and add the new `Todo` component before the `App` component:

``` js [src/App.js]
import React from 'react';
import logo from './logo.svg';
import './App.css';

function Todo({ todo }) {
  return (
    <div className="todo">
      {todo.text}
    </div>
  );
};

function App() {
  // ...
}

export default App;
```
Let’s create a list of items.

Revisit `App.js` and replace the contents of the `return` with these new lines of code:
``` js [src/App.js]
function App() {
  // ...

  return (
    <div className="app">
      <div className="todo-list">
        {todos.map((todo, index) => (
          <Todo
            key={index}
            index={index}
            todo={todo}
          />
        ))}
      </div>
    </div>
  );
}
```
By using the [JavaScript method, `map()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map), you will be able to create a new array of items by mapping over the `todo` items from state and displaying them by index.

This adds a `<div>` for `app`, a `<div>` for `todo-list`, and a map of the `todos` to `Todo` components.

At this point, it is also possible to remove the `logo.svg` as it will no longer be used.

The entire `src/App.js` file will resemble this so far:
``` js [src/App.js]
import React from "react";
import "./App.css";

function Todo({ todo }) {
  return (
    <div className="todo">
      {todo.text}
    </div>
  );
};

function App() {
  const [todos, setTodos] = React.useState([
    { text: "Learn about React" },
    { text: "Meet friend for lunch" },
    { text: "Build really cool todo app" }
  ]);

  return (
    <div className="app">
      <div className="todo-list">
        {todos.map((todo, index) => (
          <Todo
            key={index}
            index={index}
            todo={todo}
          />
        ))}
      </div>
    </div>
  );
}

export default App;
```
Open your application in a web browser. There will be three to-do items displayed:

<img src="https://assets.digitalocean.com/articles/how-to-build-a-react-to-do-app-with-react-hooks/1.png" width="100%" alt="To-do app view of items" />

You are now reading data and can continue on to the other aspects of CRUD.

## Step 4 — Creating To-Do Items
Now, let’s give your application the power to create a new item for your to-do app.

While in the `App.js` file, you will need to add a couple of things.

First, you will add another component called `TodoForm`. In this component you want to:

- Start with an empty state for an input field.
- Be able to update the form by setting the state.
- Handle the submit.
To set your state, you will write it like so:
``` js
const [value, setValue] = React.useState("");
```
The first is the “value” and the second is how you are going to be setting the state. The state starts off empty, and as you add things to your state, it will add it to your list of to-do items.

You will want to add in a `handleSubmit` variable that can handle your `addTodo` function and add the item to the list. If nothing is in the input box and the user presses `ENTER`, you want it to not add in an empty item to the list.

Add the functionality into a form that has an input box:
``` js [src/App.js]
// ...

function TodoForm({ addTodo }) {
  const [value, setValue] = React.useState("");

  const handleSubmit = e => {
    e.preventDefault();
    if (!value) return;
    addTodo(value);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        className="input"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
    </form>
  );
}

function App() {
  // ...
}

// ...
```
Add this new `TodoForm` component to your `App` component:
``` js [src/App.js]
function App() {
  // ...

  return (
    <div className="app">
      <div className="todo-list">
        {todos.map((todo, index) => (
          <Todo
            key={index}
            index={index}
            todo={todo}
          />
        ))}
        <TodoForm addTodo={addTodo} />
      </div>
    </div>
  );
}
```
Let’s build the `addTodo` function now.

Staying within `App.js`, under the state of the `App` component, the function will be able to grab the existing list of items, add on the new item, and display that new list.
``` js [src/App.js]
function App() {
  // ...

  const addTodo = text => {
    const newTodos = [...todos, { text }];
    setTodos(newTodos);
  };

  return(
    // ...
  );
}
```
Notice that there is no `this.state`. With the new React Hooks, you will have no use for `this.state` since the new Hooks understand that it is going to be implied in certain places.

There is a [spread operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax) in the code as well. The three dots before the `todos` copy the list for you so that you are able to add on the new to-do item. Then using the keyword that you set earlier, you will set the state with `setTodos`.

Open your application in a web browser. There should be three to-do items displayed. There should also be a field for adding new to-do items:

<img src="https://assets.digitalocean.com/articles/how-to-build-a-react-to-do-app-with-react-hooks/2.png" width="100%" alt="Create function in the to-do app" />

You are now creating data and can continue on to the other aspects of CRUD.

## Step 5 — Updating To-Do Items
Let’s add the functionality to cross off an item on your to-do list when they are completed.

The state in your `App` component needs a little extra for the “Completed” status to be able to change. You will be adding in another key-value pair to your list of objects.

By adding in an `isCompleted: false` value, you will set that to `false` to begin with and will, when prompted, change that to `true`.

Revisit `App.js` and add `isCompleted` to your state:
```js [src/App.js]
function App() {
  const [todos, setTodos] = React.useState([
    {
      text: "Learn about React",
      isCompleted: false
    },
    {
      text: "Meet friend for lunch",
      isCompleted: false
    },
    {
      text: "Build really cool todo app",
      isCompleted: false
    }
  ]);

  // ...
}
```
You will need a function like the `addTodo` function, but this one will be able to mark an item as “Complete”. You will do similar things that you did in `addTodo`, like using the spread operator to grab the current list of items. In this function, you will change the `isCompleted` status to true so that it knows it is complete. It will then update the state and set the state to the `newTodos`.

Update your code with the following:
``` js [src/App.js]
function App() {
  // ...

  const completeTodo = index => {
    const newTodos = [...todos];
    newTodos[index].isCompleted = true;
    setTodos(newTodos);
  };

  return (
    // ...
  )
}
```
By using `completeTodo` in the `Todo` function, you can use that functionality. When the **Complete** button is clicked, it will add in the `textDecoration: line-through` styling and cross out the item.

You will use a [ternary operator](https://www.digitalocean.com/community/tutorials/how-to-write-conditional-statements-in-javascript#ternary-operator) to complete an item and update the list:

``` js [src/App.js]
function Todo({ todo, index, completeTodo }) {
  return (
    <div
      className="todo"
      style={{ textDecoration: todo.isCompleted ? "line-through" : "" }}
    >
      {todo.text}
      <div>
        <button onClick={() => completeTodo(index)}>Complete</button>
      </div>
    </div>
  );
}
```
Add `completeTodo` in the `Todo` part of returning the `App` component:

``` js [src/App.js]
function App() {
  // ...

  return (
    <div className="app">
      <div className="todo-list">
        {todos.map((todo, index) => (
          <Todo
            key={index}
            index={index}
            todo={todo}
            completeTodo={completeTodo}
          />
        ))}
        <TodoForm addTodo={addTodo} />
      </div>
    </div>
  );
}
```
Open your application in a web browser. There will be three to-do items displayed. There will also be a **Complete** button for marking to-do items as complete.

<img src="https://assets.digitalocean.com/articles/how-to-build-a-react-to-do-app-with-react-hooks/3.png" width="100%" alt="To-do app with item updated to a completed state" />

You are now updating data and can continue on to the last aspects of CRUD.

## Step 6 — Deleting To-Do Items
Let’s add the functionality to delete an item on your to-do list when they are removed.

You will build the `removeTodo` function so that when you click on an **X** to delete an item, the item will be deleted. That function will be located by the others underneath the state of the `App` component;

``` js [src/App.js]
function App() {
  // ...

  const removeTodo = index => {
    const newTodos = [...todos];
    newTodos.splice(index, 1);
    setTodos(newTodos);
  };

  return (
    // ...
  )
}
```
In this `removeTodo` function, you will again use the spread operator, but once you grab that current list, you will be [**splicing**](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/splice) the chosen index off of the array of items. Once that is removed, you will return the new state by setting it with `setTodos` to be `newTodos`.

In your `Todo` function, you will want to add in a button to remove the to-do item:

``` js [src/App.js]
function Todo({ todo, index, completeTodo, removeTodo }) {
  return (
    <div
      className="todo"
      style={{ textDecoration: todo.isCompleted ? "line-through" : "" }}
    >
      {todo.text}
      <div>
        <button onClick={() => completeTodo(index)}>Complete</button>
        <button onClick={() => removeTodo(index)}>x</button>
      </div>
    </div>
  );
}
```
Add `removeTodo` in the `Todo` part of returning the `App` component:

``` js [src/App.js]
function App() {
  // ...

  return (
    <div className="app">
      <div className="todo-list">
        {todos.map((todo, index) => (
          <Todo
            key={index}
            index={index}
            todo={todo}
            completeTodo={completeTodo}
            removeTodo={removeTodo}
          />
        ))}
        <TodoForm addTodo={addTodo} />
      </div>
    </div>
  );
}
```
Open your application in a web browser. There will be three to-do items displayed. There will also be an **X** button for removing to-do items.

<img src="https://assets.digitalocean.com/articles/how-to-build-a-react-to-do-app-with-react-hooks/4.png" width="100%" alt="To-do app with delete button" />

You are now deleting data and have implemented all four aspects of CRUD.

## Step 7 — Finalizing the App
After you have put together the `Todo` component, the `TodoForm` component, and the `App` component, your `App.js` file will resemble this:

``` js [src/App.js]
import React from "react";
import "./App.css";

function Todo({ todo, index, completeTodo, removeTodo }) {
  return (
    <div
      className="todo"
      style={{ textDecoration: todo.isCompleted ? "line-through" : "" }}
    >
      {todo.text}
      <div>
        <button onClick={() => completeTodo(index)}>Complete</button>
        <button onClick={() => removeTodo(index)}>x</button>
      </div>
    </div>
  );
}

function TodoForm({ addTodo }) {
  const [value, setValue] = React.useState("");

  const handleSubmit = e => {
    e.preventDefault();
    if (!value) return;
    addTodo(value);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        className="input"
        value={value}
        onChange={e => setValue(e.target.value)}
      />
    </form>
  );
}

function App() {
  const [todos, setTodos] = React.useState([
    {
      text: "Learn about React",
      isCompleted: false
    },
    {
      text: "Meet friend for lunch",
      isCompleted: false
    },
    {
      text: "Build really cool todo app",
      isCompleted: false
    }
  ]);

  const addTodo = text => {
    const newTodos = [...todos, { text }];
    setTodos(newTodos);
  };

  const completeTodo = index => {
    const newTodos = [...todos];
    newTodos[index].isCompleted = true;
    setTodos(newTodos);
  };

  const removeTodo = index => {
    const newTodos = [...todos];
    newTodos.splice(index, 1);
    setTodos(newTodos);
  };

  return (
    <div className="app">
      <div className="todo-list">
        {todos.map((todo, index) => (
          <Todo
            key={index}
            index={index}
            todo={todo}
            completeTodo={completeTodo}
            removeTodo={removeTodo}
          />
        ))}
        <TodoForm addTodo={addTodo} />
      </div>
    </div>
  );
}

export default App;
```
You now have an application for all four aspects of CRUD. Creating to-do items, reading to-do items, updating to-do items, and deleting to-do items.

## Conclusion
A to-do app can be a great reminder or starting point when it comes to CRUD in web development. Being able to read information, create new information, update existing information, and delete information can be powerful in any application.

In this tutorial, your created a CRUD To-do list app with [React Hooks](https://scotch.io/tutorials/getting-started-with-react-hooks), which allowed for code to be clear, concise, and straightforward.

If you’d like to learn more about React, check out our React topic page for exercises and programming projects.

[source](https://www.digitalocean.com/community/tutorials/how-to-build-a-react-to-do-app-with-react-hooks)