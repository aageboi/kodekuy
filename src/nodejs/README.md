---
sidebar: auto
---

# Building a Real-Time Webapp with Node.js and Socket.io

In this blogpost we showcase a project we recently finished for [National Democratic Institute](https://www.ndi.org/), an NGO that supports democratic institutions and practices worldwide. NDI’s mission is to strengthen political and civic organizations, safeguard elections and promote citizen participation, openness and accountability in government.

Our assignment was to build an MVP of an application that supports the facilitators of a cybersecurity themed interactive simulation game. As this webapp needs to be used by several people on different machines at the same time, it needed real-time synchronization which we implemented using Socket.io.

In the following article you can learn more about how we approached the project, how we structured the data access layer and how we solved challenges around creating our websocket server, just to mention a few. The final code of the project is open-source, and you’re free to check it out on [Github](https://github.com/nditech/CyberSim-Backend).

A Brief Overview of the CyberSim Project
Political parties are at extreme risk to hackers and other adversaries, however, they rarely understand the range of threats they face. When they do get cybersecurity training, it’s often in the form of dull, technically complicated lectures. To help parties and campaigns better understand the challenges they face, NDI developed a cybersecurity simulation (CyberSim) about a political campaign rocked by a range of security incidents. The goal of the CyberSim is to facilitate buy-in for and implementation of better security practices by helping political campaigns assess their own readiness and experience the potential consequences of unmitigated risks.

The CyberSim is broken down into three core segments: preparation, simulation, and an after action review. During the preparation phase, participants are introduced to a fictional (but realistic) game-play environment, their roles, and the rules of the game. They are also given an opportunity to select security-related mitigations from a limited budget, providing an opportunity to "secure their systems" to the best of their knowledge and ability before the simulation begins.

<img src="https://blog.risingstack.com/content/images/2021/02/real-time-nodejs-app-with-websocket-socket-io.png" alt="real-time-nodejs-app-with-websocket-socket-io" width="100%" />

The simulation itself runs for 75 minutes, during which time the participants have the ability to take actions to raise funds, boost support for their candidate and, most importantly, respond to events that occur that may negatively impact their campaign's success. These events are meant to test the readiness, awareness and skills of the participants related to information security best practices. The simulation is designed to mirror the busyness and intensity of a typical campaign environment.

<img src="https://blog.risingstack.com/content/images/2021/02/socketio-actions.png" alt="socketio-actions" width="100%" />

The after action review is in many ways the most critical element of the CyberSim exercise. During this segment, CyberSim facilitators and participants review what happened during the simulation, what events lead to which problems during the simulation, and what actions the participants took (or should have taken) to prevent security incidents from occurring. These lessons are closely aligned with the best practices presented in the [Cybersecurity Campaigns Playbook](https://www.ndi.org/publications/cybersecurity-campaign-playbook-global-edition), making the CyberSim an ideal opportunity to reinforce existing knowledge or introduce new best practices presented there.

<img src="https://blog.risingstack.com/content/images/2021/02/assessment-screen-socketio.png" alt="assessment-screen-socketio" width="100%" />

Since data representation serves as the skeleton of each application, Norbert - who built part of the app will first walk you through the data layer created using [knex](https://www.npmjs.com/package/knex) and Node.js. Then he will move to the program's hearth, the socket server that manages real-time communication.

This is going to be a series of articles, so in the next part, we will look at the frontend, which is built with React. Finally, in the third post, Norbert will present the muscle that is the project's infrastructure. We used Amazon's tools to create the CI/CD, host the webserver, the static frontend app, and the database.

Now that we're through with the intro, you can enjoy reading this Socket.io tutorial / Case Study from Norbert:

The Project's Structure
Before diving deep into the data access layer, let's take a look at the project's structure:

```
.

├── migrations
│   └── ...
├── seeds
│   └── ...
├── src
│   ├── config.js
│   ├── logger.js
│   ├── constants
│   │   └── ...
│   ├── models
│   │   └── ...
│   ├── util
│   │   └── ...
│   ├── app.js
│   └── socketio.js
└── index.js
```

As you can see, the structure is relatively straightforward, as we’re not really deviating from a standard [Node.js project structure](https://blog.risingstack.com/node-js-project-structure-tutorial-node-js-at-scale/). To better understand the application, let’s start with the data model.

## The Data Access Layer
Each game starts with a preprogrammed poll percentage and an available budget. Throughout the game, threats (called injections) occur at a predefined time (e.g., in the second minute) to which players have to respond. To spice things up, the staff has several systems required to make responses and take actions. These systems often go down as a result of injections. The game's final goal is simple: the players have to maximize their party's poll by answering each threat.

We used a PostgreSQL database to store the state of each game. Tables that make up the data model can be classified into two different groups: setup and state tables. Setup tables store data that are identical and constant for each game, such as:

- **injections** - contains each threat player face during the game, e.g., `Databreach`
- **injection** responses - a one-to-many table that shows the possible reactions for each injection
- **action** - operations that have an immediate on-time effect, e.g., `Campaign advertisement`
- **systems** - tangible and intangible IT assets, which are prerequisites of specific responses and actions, e.g., `HQ Computers`
- **mitigations** - tangible and intangible assets that mitigate upcoming injections, e.g., `Create a secure backup for the online party voter database`
- **roles** - different divisions of a campaign party, e.g., `HQ IT Team`
- **curveball events** - one-time events controlled by the facilitators, e.g., `Banking system crash`

On the other hand, state tables define the state of a game and change during the simulation. These tables are the following:

- **game** - properties of a game like `budget`, `poll`, etc.
- **game systems** - stores the condition of each system (is it online or offline) throughout the game
- **game mitigations** - shows if players have bought each mitigation
- **game injection** - stores information about injections that have happened, e.g., `was it prevented, responses made to it`
- **game log**

To help you visualize the database schema, have a look at the following diagram. Please note that the game_log table was intentionally left from the image since it adds unnecessary complexity to the picture and doesn’t really help understand the core functionality of the game:

<img src="https://blog.risingstack.com/content/images/2021/02/database_schema_socketio.png" alt="database_schema_socketio" width="100%" />

To sum up, state tables always store any ongoing game's current state. Each modification done by a facilitator must be saved and then transported back to every coordinator. To do so, we defined a method in the data access layer to return the current state of the game by calling the following function after the state is updated:

<img src="https://blog.risingstack.com/content/images/2021/02/socketio_db_schema_faded.png" alt="socketio_db_schema_faded" width="100%" />


```js
//./src/game.js
const db = require('./db');

const getGame = (id) =>
db('game')
  .select(
    'game.id',
    'game.state',
    'game.poll',
    'game.budget',
    'game.started_at',
    'game.paused',
    'game.millis_taken_before_started',
    'i.injections',
    'm.mitigations',
    's.systems',
    'l.logs',
  )
  .where({ 'game.id': id })
  .joinRaw(
    `LEFT JOIN (SELECT gm.game_id, array_agg(to_json(gm)) AS mitigations FROM game_mitigation gm GROUP BY gm.game_id) m ON m.game_id = game.id`,
  )
  .joinRaw(
    `LEFT JOIN (SELECT gs.game_id, array_agg(to_json(gs)) AS systems FROM game_system gs GROUP BY gs.game_id) s ON s.game_id = game.id`,
  )
  .joinRaw(
    `LEFT JOIN (SELECT gi.game_id, array_agg(to_json(gi)) AS injections FROM game_injection gi GROUP BY gi.game_id) i ON i.game_id = game.id`,
  )
  .joinRaw(
    `LEFT JOIN (SELECT gl.game_id, array_agg(to_json(gl)) AS logs FROM game_log gl GROUP BY gl.game_id) l ON l.game_id = game.id`,
  )
  .first();
```

The `const db = require('./db');` line returns a database connection established via knex, used for querying and updating the database. By calling the function above, the current state of a game can be retrieved, including each mitigation already purchased and still available for sale, online and offline systems, injections that have happened, and the game's log. Here is an example of how this logic is applied after a facilitator triggers a curveball event:

```js
//./src/game.js
const performCurveball = async ({ gameId, curveballId }) => {
 try {
   const game = await db('game')
     .select(
       'budget',
       'poll',
       'started_at as startedAt',
       'paused',
       'millis_taken_before_started as millisTakenBeforeStarted',
     )
     .where({ id: gameId })
     .first();

   const { budgetChange, pollChange, loseAllBudget } = await db('curveball')
     .select(
       'lose_all_budget as loseAllBudget',
       'budget_change as budgetChange',
       'poll_change as pollChange',
     )
     .where({ id: curveballId })
     .first();

   await db('game')
     .where({ id: gameId })
     .update({
       budget: loseAllBudget ? 0 : Math.max(0, game.budget + budgetChange),
       poll: Math.min(Math.max(game.poll + pollChange, 0), 100),
     });

   await db('game_log').insert({
     game_id: gameId,
     game_timer: getTimeTaken(game),
     type: 'Curveball Event',
     curveball_id: curveballId,
   });
 } catch (error) {
   logger.error('performCurveball ERROR: %s', error);
   throw new Error('Server error on performing action');
 }
 return getGame(gameId);
};
```

As you can examine, after the update on the game's state happens, which this time is a change in budget and poll, the program calls the `getGame` function and returns its result. By applying this logic, we can manage the state easily. We have to arrange each coordinator of the same game into groups, somehow map each possible event to a corresponding function in the `models` folder, and broadcast the game to everyone after someone makes a change. Let's see how we achieved it by leveraging WebSockets.

## Creating Our Real-Time Socket.io Server with Node.js
As the software we’ve created is a companion app to an actual tabletop game played at different locations, it is as real time as it gets. To handle such use cases, where the state of the UI-s needs to be synchronized across multiple clients, WebSockets are the go-to solution. To implement the WebSocket server and client, we chose to use Socket.io. While Socket.io clearly comes with a huge performance overhead, it freed us from a lot of hassle that arises from the stafeful nature of WebSocket connections. As the expected load was minuscule, the overhead Socket.io introduced was way overshadowed by the savings in development time it provided. One of the killer features of Socket.io that fit our use case very well was that operators who join the same game can be separated easily using socket.io rooms. This way, after a participant updates the game, we can broadcast the new state to the entire room (everyone who currently joined a particular game).

To create a socket server, all we need is a Server instance created by the createServer method of the default Node.js http module. For maintainability, we organized the socket.io logic into its separate module (see: `.src/socketio.js`). This module exports a factory function with one argument: an http Server object. Let's have a look at it:

```js
// ./src/socketio.js
const socketio = require('socket.io');

const SocketEvents = require('./constants/SocketEvents');

module.exports = (http) => {
  const io = socketio(http);

  io.on(SocketEvents.CONNECT, (socket) => {
    socket.on('EVENT', (input) => {
        // DO something with the given input
    })
  }
}
```

```js
// index.js
const { createServer } = require('http');
const app = require('./src/app'); // Express app
const createSocket = require('./src/socketio');

const port = process.env.PORT || 3001;
const http = createServer(app);
createSocket(http);

const server = http.listen(port, () => {
  logger.info(`Server is running at port: ${port}`);
});
```

As you can see, the socket server logic is implemented inside the factory function. In the `index.js` file then this function is called with the http Server. We didn't have to implement authorization during this project, so there isn't any socket.io middleware that authenticates each client before establishing the connection. Inside the socket.io module, we created an event handler for each possible action a facilitator can perform, including the documentation of responses made to injections, buying mitigations, restoring systems, etc. Then we mapped our methods defined in the data access layer to these handlers.

## Bringing together facilitators
I previously mentioned that rooms make it easy to distinguish facilitators by which game they currently joined in. A facilitator can enter a room by either creating a fresh new game or joining an existing one. By translating this to "WebSocket language", a client emits a `createGame` or `joinGame` event. Let's have a look at the corresponding implementation:

```js
// ./src/socketio.js
const socketio = require('socket.io');

const SocketEvents = require('./constants/SocketEvents');
const logger = require('./logger');
const {
 createGame,
 getGame,
} = require('./models/game');

module.exports = (http) => {
 const io = socketio(http);

 io.on(SocketEvents.CONNECT, (socket) => {
   logger.info('Facilitator CONNECT');
   let gameId = null;

   socket.on(SocketEvents.DISCONNECT, () => {
     logger.info('Facilitator DISCONNECT');
   });

   socket.on(SocketEvents.CREATEGAME, async (id, callback) => {
     logger.info('CREATEGAME: %s', id);
     try {
       const game = await createGame(id);
       if (gameId) {
         await socket.leave(gameId);
       }
       await socket.join(id);
       gameId = id;
       callback({ game });
     } catch (_) {
       callback({ error: 'Game id already exists!' });
     }
   });

   socket.on(SocketEvents.JOINGAME, async (id, callback) => {
     logger.info('JOINGAME: %s', id);
     try {
       const game = await getGame(id);
       if (!game) {
         callback({ error: 'Game not found!' });
       }
       if (gameId) {
         await socket.leave(gameId);
       }
       await socket.join(id);
       gameId = id;
       callback({ game });
     } catch (error) {
       logger.error('JOINGAME ERROR: %s', error);
       callback({ error: 'Server error on join game!' });
     }
   });
 }
}
```

If you examine the code snippet above, the **gameId** variable contains the game's id, the facilitators currently joined. By utilizing the javascript closures, we declared this variable inside the **connect** callback function. Hence the **gameId** variable will be in all following handlers' scope. If an organizer tries to create a game while already playing (which means that **gameId** is not null), the socket server first kicks the facilitator out of the previous game's room then joins the facilitator in the new game room. This is managed by the **leave** and **join** methods. The process flow of the **joinGame** handler is almost identical. The only keys difference is that this time the server doesn't create a new game. Instead, it queries the already existing one using the infamous **getGame** method of the data access layer.

## What Makes Our Event Handlers?
After we successfully brought together our facilitators, we had to create a different handler for each possible event. For the sake of completeness, let's look at all the events that occur during a game:

- **createGame**, **joinGame**: these events' single purpose is to join the correct game room organizer.
- **startSimulation**, **pauseSimulation**, **finishSimulation**: these events are used to start the event's timer, pause the timer, and stop the game entirely. Once someone emits a **finishGame** event, it can't be restarted.
- **deliverInjection**: using this event, facilitators trigger security threats, which should occur in a given time of the game.
- **respondToInjection**, **nonCorrectRespondToInjection**: these events record the responses made to injections.
- **restoreSystem**: this event is to restore any system which is offline due to an injection.
- **changeMitigation**: this event is triggered when players buy mitigations to prevent injections.
- **performAction**: when the playing staff performs an action, the client emits this event to the server.
- **performCurveball**: this event occurs when a facilitator triggers unique injections.

These event handlers implement the following rules:

- They take up to two arguments, an optional input, which is different for each event, and a predefined callback. The callback is an exciting feature of socket.io called acknowledgment. It lets us create a callback function on the client-side, which the server can call with either an error or a game object. This call will then affect the client-side. Without diving deep into how the front end works (since this is a topic for another day), this function pops up an alert with either an error or a success message. This message will only appear for the facilitator who initiated the event.
- They update the state of the game by the given inputs according to the event's nature.
- They broadcast the new state of the game to the entire room. Hence we can update the view of all organizers accordingly.
First, let's build on our previous example and see how the handler implemented the curveball events.

```js
// ./src/socketio.js
const socketio = require('socket.io');

const SocketEvents = require('./constants/SocketEvents');
const logger = require('./logger');
const {
 performCurveball,
} = require('./models/game');

module.exports = (http) => {
 const io = socketio(http);

 io.on(SocketEvents.CONNECT, (socket) => {
   logger.info('Facilitator CONNECT');
   let gameId = null;

   socket.on(
     SocketEvents.PERFORMCURVEBALL,
     async ({ curveballId }, callback) => {
       logger.info(
         'PERFORMCURVEBALL: %s',
         JSON.stringify({ gameId, curveballId }),
       );
       try {
         const game = await performCurveball({
           gameId,
           curveballId,
         });
         io.in(gameId).emit(SocketEvents.GAMEUPDATED, game);
         callback({ game });
       } catch (error) {
         callback({ error: error.message });
       }
     },
   );
 }
}
```

The curveball event handler takes one input, a **curveballId** and the callback as mentioned earlier. The **performCurveball** method then updates the game's poll and budget and returns the new game object. If the update is successful, the socket server emits a **gameUpdated** event to the game room with the latest state. Then it calls the callback function with the game object. If any error occurs, it is called with an error object.

After a facilitator creates a game, first, a preparation view is loaded for the players. In this stage, staff members can spend a portion of their budget to buy mitigations before the game starts. Once the game begins, it can be paused, restarted, or even stopped permanently. Let's have a look at the corresponding implementation:

```js
// ./src/socketio.js
const socketio = require('socket.io');

const SocketEvents = require('./constants/SocketEvents');
const logger = require('./logger');
const {
 startSimulation,
 pauseSimulation
} = require('./models/game');

module.exports = (http) => {
 const io = socketio(http);

 io.on(SocketEvents.CONNECT, (socket) => {
   logger.info('Facilitator CONNECT');
   let gameId = null;

   socket.on(SocketEvents.STARTSIMULATION, async (callback) => {
     logger.info('STARTSIMULATION: %s', gameId);
     try {
       const game = await startSimulation(gameId);
       io.in(gameId).emit(SocketEvents.GAMEUPDATED, game);
       callback({ game });
     } catch (error) {
       callback({ error: error.message });
     }
   });

   socket.on(SocketEvents.PAUSESIMULATION, async (callback) => {
     logger.info('PAUSESIMULATION: %s', gameId);
     try {
       const game = await pauseSimulation({ gameId });
       io.in(gameId).emit(SocketEvents.GAMEUPDATED, game);
       callback({ game });
     } catch (error) {
       callback({ error: error.message });
     }
   });

   socket.on(SocketEvents.FINISHSIMULATION, async (callback) => {
     logger.info('FINISHSIMULATION: %s', gameId);
     try {
       const game = await pauseSimulation({ gameId, finishSimulation: true });
       io.in(gameId).emit(SocketEvents.GAMEUPDATED, game);
       callback({ game });
     } catch (error) {
       callback({ error: error.message });
     }
   });
 }
}
```

The **startSimulation** kicks the game's timer, and the **pauseSimulation** method pauses and stops the game. Trigger time is essential to determine which injection facilitators can invoke. After organizers trigger a threat, they hand over all necessary assets to the players. Staff members can then choose how they respond to the injection by providing a custom response or choosing from the predefined options. Next to facing threats, staff members perform actions, restore systems, and buy mitigations. The corresponding events to these activities can be triggered anytime during the game. These event handlers follow the same pattern and implement ourthe three fundamental rules. Please check the [public GitHub repo](https://github.com/nditech/CyberSim-Backend) if you would like to examine these callbacks.

## Serving The Setup Data

In the chapter explaining the data access layer, I classified tables into two different groups: setup and state tables. State tables contain the condition of ongoing games. This data is served and updated via the event-based socket server. On the other hand, setup data consists of the available systems, game mitigations, actions, and curveball events, injections that occur during the game, and each possible response to them. This data is exposed via a simple http server. After a facilitator joins a game, the React client requests this data and caches and uses it throughout the game. The HTTP server is implemented using the express library. Let's have a look at our app.js.

```js
// .src/app.js
const helmet = require('helmet');
const express = require('express');
const cors = require('cors');
const expressPino = require('express-pino-logger');

const logger = require('./logger');
const { getResponses } = require('./models/response');
const { getInjections } = require('./models/injection');
const { getActions } = require('./models/action');

const app = express();

app.use(helmet());
app.use(cors());
app.use(
 expressPino({
   logger,
 }),
);

// STATIC DB data is exposed via REST api

app.get('/mitigations', async (req, res) => {
 const records = await db('mitigation');
 res.json(records);
});

app.get('/systems', async (req, res) => {
 const records = await db('system');
 res.json(records);
});

app.get('/injections', async (req, res) => {
 const records = await getInjections();
 res.json(records);
});

app.get('/responses', async (req, res) => {
 const records = await getResponses();
 res.json(records);
});

app.get('/actions', async (req, res) => {
 const records = await getActions();
 res.json(records);
});

app.get('/curveballs', async (req, res) => {
 const records = await db('curveball');
 res.json(records);
});

module.exports = app;
```

As you can see, everything is pretty standard here. We didn't need to implement any method other than **GET** since this data is inserted and changed using seeds.

## Final Thoughts On Our Socket.io Game
Now we can put together how the backend works. State tables store the games' state, and the data access layer returns the new game state after each update. The socket server organizes the facilitators into rooms, so each time someone changes something, the new game is broadcasted to the entire room. Hence we can make sure that everyone has an up-to-date view of the game. In addition to dynamic game data, static tables are accessible via the http server.

Next time, we will look at how the React client manages all this, and after that I'll present the infrastructure behind the project. You can check out the code of this app in the [public GitHub repo](https://github.com/nditech/CyberSim-Backend)!

In case you're looking for experienced full-stack developers, feel free to reach out to us via **info@risingstack.com**, or via using the form below this article.

You can also check out our [Node.js Development & Consulting](https://risingstack.com/nodejs-development-consulting-services) service page for more info on our capabilities.

[source](https://blog.risingstack.com/real-time-node-js-webapp-socket-io/)