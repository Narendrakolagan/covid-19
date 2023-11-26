const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "covid19IndiaPortal.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

// LOGIN USER API1

app.post("/login/", async (request, response) => {
  const { username, password } = request.body;
  const userDbQuery = `
    
    SELECT 
    * 
    FROM 
    user 
    WHERE 
    username = '${username}'
    `;
  const dbUser = await db.get(userDbQuery);

  if (dbUser === undefined) {
    response.status(400);
    response.send("Invalid user");
  } else {
    const isPasswordValid = await bcrypt.compare(password, dbUser.password);

    if (isPasswordValid === true) {
      const payload = { username: username };
      const jwtToken = jwt.sign(payload, "ivnndkvmnkdnv");
      response.send({ jwtToken });
    } else {
      response.status(400);
      response.send("Invalid password");
    }
  }
});

// GET API2

app.get("/states/", async (request, response) => {
  const authHeader = request.headers["authorization"];
  let jwtToken;
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "ivnndkvmnkdnv", async (error, user) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        const getStatesQuery = `
        
                SELECT 
                state_id AS stateId,
                state_name AS stateName,
                population 
                FROM 
                state
                `;

        const states = await db.all(getStatesQuery);
        response.send(states);
      }
    });
  }
});
module.exports = app;

// GET API3

app.get("/states/:stateId/", async (request, response) => {
  const { stateId } = request.params;
  const authHeader = request.headers["authorization"];
  let jwtToken;
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "ivnndkvmnkdnv", async (error, user) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        const getStateQuery = `
        SELECT 
        state_id AS stateId,
        state_name AS stateName,
        population
        FROM 
        state
        WHERE
        state_id = ${stateId};
        `;
        const state = await db.get(getStateQuery);
        response.send(state);
      }
    });
  }
});
module.exports = app;

// POST API4

app.post("/districts/", async (request, response) => {
  const { districtName, stateId, cases, cured, active, deaths } = request.body;

  const authHeader = request.headers["authorization"];
  let jwtToken;
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "ivnndkvmnkdnv", async (error, user) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        const createdDistricts = `
    
        INSERT 
        INTO
        district
        (district_name, state_id, cases, cured, active, deaths)
        VALUES
        (
            '${districtName}',
            ${stateId},
            ${cases},
            ${cured},
            ${active},
            ${deaths}
        );

        `;
        await db.run(createdDistricts);
        response.send("District Successfully Added");
      }
    });
  }
});
module.exports = app;

// GET DISTRICT API5

app.get("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const authHeader = request.headers["authorization"];
  let jwtToken;
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "ivnndkvmnkdnv", async (error, user) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        const getDistrictQuery = `
    
        SELECT 
        district_id AS districtId,
        district_name AS districtName,
        state_id AS stateId,
        cases,
        cured,
        active,
        deaths
        FROM 
        district
        WHERE 
        district_id = ${districtId};
    `;
        const district = await db.get(getDistrictQuery);

        response.send(district);
      }
    });
  }
});
module.exports = app;

// DELETE DISTRICT API6

app.delete("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const authHeader = request.headers["authorization"];
  let jwtToken;
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "ivnndkvmnkdnv", async (error, user) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        const getDeleteQuery = `
    
        DELETE 
        FROM 
        district
        WHERE
        district_id = ${districtId};
        `;
        await db.run(getDeleteQuery);
        response.send("District Removed");
      }
    });
  }
});
module.exports = app;

// PUT API7

app.put("/districts/:districtId/", async (request, response) => {
  const { districtId } = request.params;
  const { districtName, stateId, cases, cured, active, deaths } = request.body;

  const authHeader = request.headers["authorization"];
  let jwtToken;
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "ivnndkvmnkdnv", async (error, user) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        const getUpdatedQuery = `
    
        UPDATE 
        district
        SET 
        district_name = '${districtName}',
        state_id = ${stateId},
        cases = ${cases},
        cured = ${cured},
        active = ${active},
        deaths = ${deaths}
        WHERE
        district_id = ${districtId}
        `;
        await db.run(getUpdatedQuery);
        response.send("District Details Updated");
      }
    });
  }
});
module.exports = app;

// GET API8

app.get("/states/:stateId/stats/", async (request, response) => {
  const { stateId } = request.params;

  const authHeader = request.headers["authorization"];
  let jwtToken;
  if (authHeader !== undefined) {
    jwtToken = authHeader.split(" ")[1];
  }
  if (jwtToken === undefined) {
    response.status(401);
    response.send("Invalid JWT Token");
  } else {
    jwt.verify(jwtToken, "ivnndkvmnkdnv", async (error, user) => {
      if (error) {
        response.status(401);
        response.send("Invalid JWT Token");
      } else {
        const getStatisticsQuery = `
    
        SELECT 
        SUM(cases),
        SUM(cured),
        SUM(active ,
        SUM(deaths) 
        FROM
        district
        WHERE
        state_id = ${stateId};
        `;
        const stats = await db.getStatisticsQuery;
        response.send(stats);
      }
    });
  }
});
module.exports = app;
