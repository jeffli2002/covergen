creem
Developer-friendly & type-safe Typescript SDK specifically catered to leverage creem API.

 



Summary
Creem API: Creem is an all-in-one platform for managing subscriptions and recurring revenue, tailored specifically for today's SaaS companies. It enables you to boost revenue, enhance customer retention, and scale your operations seamlessly.'

Summary
Creem API: Creem is an all-in-one platform for managing subscriptions and recurring revenue, tailored specifically for today's SaaS companies. It enables you to boost revenue, enhance customer retention, and scale your operations seamlessly.'

Table of Contents
creem
SDK Installation
Requirements
SDK Example Usage
Available Resources and Operations
Standalone functions
Retries
Error Handling
Server Selection
Custom HTTP Client
Debugging
Development
Maturity
Contributions
SDK Installation
The SDK can be installed with either npm, pnpm, bun or yarn package managers.

NPM
npm add creem
PNPM
pnpm add creem
Bun
bun add creem
Yarn
yarn add creem zod

# Note that Yarn does not install peer dependencies automatically. You will need
# to install zod as shown above.
Note

This package is published with CommonJS and ES Modules (ESM) support.

Model Context Protocol (MCP) Server
This SDK is also an installable MCP server where the various SDK methods are exposed as tools that can be invoked by AI applications.

Node.js v20 or greater is required to run the MCP server from npm.

Claude installation steps
Cursor installation steps
You can also run MCP servers as a standalone binary with no additional dependencies. You must pull these binaries from available Github releases:

curl -L -o mcp-server \
    https://github.com/{org}/{repo}/releases/download/{tag}/mcp-server-bun-darwin-arm64 && \
chmod +x mcp-server
If the repo is a private repo you must add your Github PAT to download a release -H "Authorization: Bearer {GITHUB_PAT}".

{
  "mcpServers": {
    "Todos": {
      "command": "./DOWNLOAD/PATH/mcp-server",
      "args": [
        "start"
      ]
    }
  }
}
For a full list of server arguments, run:

npx -y --package creem -- mcp start --help
Requirements
For supported JavaScript runtimes, please consult RUNTIMES.md.

SDK Example Usage
Example
import { Creem } from "creem";

const creem = new Creem();

async function run() {
  const result = await creem.retrieveProduct({
    productId: "<id>",
    xApiKey: "<value>",
  });

  // Handle the result
  console.log(result);
}

run();
Available Resources and Operations
Available methods
Creem SDK
retrieveProduct - Retrieve a product
createProduct - Creates a new product.
searchProducts - List all products
retrieveCustomer - Retrieve a customer
generateCustomerLinks - Generate Customer Links
retrieveSubscription - Retrieve a subscription
cancelSubscription - Cancel a subscription.
updateSubscription - Update a subscription.
upgradeSubscription - Upgrade a subscription to a different product
retrieveCheckout - Retrieve a new checkout session.
createCheckout - Creates a new checkout session.
activateLicense - Activates a license key.
deactivateLicense - Deactivate a license key instance.
validateLicense - Validates a license key or instance.
retrieveDiscount - Retrieve discount
createDiscount - Create a discount.
deleteDiscount - Delete a discount.
searchTransactions - List all transactions
Standalone functions
All the methods listed above are available as standalone functions. These functions are ideal for use in applications running in the browser, serverless runtimes or other environments where application bundle size is a primary concern. When using a bundler to build your application, all unused functionality will be either excluded from the final bundle or tree-shaken away.

To read more about standalone functions, check FUNCTIONS.md.

Available standalone functions
Retries
Some of the endpoints in this SDK support retries. If you use the SDK without any configuration, it will fall back to the default retry strategy provided by the API. However, the default retry strategy can be overridden on a per-operation basis, or across the entire SDK.

To change the default retry strategy for a single API call, simply provide a retryConfig object to the call:

import { Creem } from "creem";

const creem = new Creem();

async function run() {
  const result = await creem.retrieveProduct({
    productId: "<id>",
    xApiKey: "<value>",
  }, {
    retries: {
      strategy: "backoff",
      backoff: {
        initialInterval: 1,
        maxInterval: 50,
        exponent: 1.1,
        maxElapsedTime: 100,
      },
      retryConnectionErrors: false,
    },
  });

  // Handle the result
  console.log(result);
}

run();
If you'd like to override the default retry strategy for all operations that support retries, you can provide a retryConfig at SDK initialization:

import { Creem } from "creem";

const creem = new Creem({
  retryConfig: {
    strategy: "backoff",
    backoff: {
      initialInterval: 1,
      maxInterval: 50,
      exponent: 1.1,
      maxElapsedTime: 100,
    },
    retryConnectionErrors: false,
  },
});

async function run() {
  const result = await creem.retrieveProduct({
    productId: "<id>",
    xApiKey: "<value>",
  });

  // Handle the result
  console.log(result);
}

run();
Error Handling
If the request fails due to, for example 4XX or 5XX status codes, it will throw a APIError.

Error Type	Status Code	Content Type
errors.APIError	4XX, 5XX	*/*
import { Creem } from "creem";
import { SDKValidationError } from "creem/models/errors";

const creem = new Creem();

async function run() {
  let result;
  try {
    result = await creem.retrieveProduct({
      productId: "<id>",
      xApiKey: "<value>",
    });

    // Handle the result
    console.log(result);
  } catch (err) {
    switch (true) {
      // The server response does not match the expected SDK schema
      case (err instanceof SDKValidationError):
        {
          // Pretty-print will provide a human-readable multi-line error message
          console.error(err.pretty());
          // Raw value may also be inspected
          console.error(err.rawValue);
          return;
        }
        apierror.js;
      // Server returned an error status code or an unknown content type
      case (err instanceof APIError): {
        console.error(err.statusCode);
        console.error(err.rawResponse.body);
        return;
      }
      default: {
        // Other errors such as network errors, see HTTPClientErrors for more details
        throw err;
      }
    }
  }
}

run();
Validation errors can also occur when either method arguments or data returned from the server do not match the expected format. The SDKValidationError that is thrown as a result will capture the raw value that failed validation in an attribute called rawValue. Additionally, a pretty() method is available on this error that can be used to log a nicely formatted multi-line string since validation errors can list many issues and the plain error string may be difficult read when debugging.

In some rare cases, the SDK can fail to get a response from the server or even make the request due to unexpected circumstances such as network conditions. These types of errors are captured in the models/errors/httpclienterrors.ts module:

HTTP Client Error	Description
RequestAbortedError	HTTP request was aborted by the client
RequestTimeoutError	HTTP request timed out due to an AbortSignal signal
ConnectionError	HTTP client was unable to make a request to a server
InvalidRequestError	Any input used to create a request is invalid
UnexpectedClientError	Unrecognised or unexpected error
Server Selection
Select Server by Index
You can override the default server globally by passing a server index to the serverIdx: number optional parameter when initializing the SDK client instance. The selected server will then be used as the default on the operations that use it. This table lists the indexes associated with the available servers:

#	Server	Description
0	https://api.creem.io	
1	https://test-api.creem.io	
2	http://localhost:8000	
Example
import { Creem } from "creem";

const creem = new Creem({
  serverIdx: 2,
});

async function run() {
  const result = await creem.retrieveProduct({
    productId: "<id>",
    xApiKey: "<value>",
  });

  // Handle the result
  console.log(result);
}

run();
Override Server URL Per-Client
The default server can also be overridden globally by passing a URL to the serverURL: string optional parameter when initializing the SDK client instance. For example:

import { Creem } from "creem";

const creem = new Creem({
  serverURL: "http://localhost:8000",
});

async function run() {
  const result = await creem.retrieveProduct({
    productId: "<id>",
    xApiKey: "<value>",
  });

  // Handle the result
  console.log(result);
}

run();

Custom HTTP Client
The TypeScript SDK makes API calls using an HTTPClient that wraps the native Fetch API. This client is a thin wrapper around fetch and provides the ability to attach hooks around the request lifecycle that can be used to modify the request or handle errors and response.

The HTTPClient constructor takes an optional fetcher argument that can be used to integrate a third-party HTTP client or when writing tests to mock out the HTTP client and feed in fixtures.

The following example shows how to use the "beforeRequest" hook to to add a custom header and a timeout to requests and how to use the "requestError" hook to log errors:

import { Creem } from "creem";
import { HTTPClient } from "creem/lib/http";

const httpClient = new HTTPClient({
  // fetcher takes a function that has the same signature as native `fetch`.
  fetcher: (request) => {
    return fetch(request);
  }
});

httpClient.addHook("beforeRequest", (request) => {
  const nextRequest = new Request(request, {
    signal: request.signal || AbortSignal.timeout(5000)
  });

  nextRequest.headers.set("x-custom-header", "custom value");

  return nextRequest;
});

httpClient.addHook("requestError", (error, request) => {
  console.group("Request Error");
  console.log("Reason:", `${error}`);
  console.log("Endpoint:", `${request.method} ${request.url}`);
  console.groupEnd();
});

const sdk = new Creem({ httpClient });


Debugging
You can setup your SDK to emit debug logs for SDK requests and responses.

You can pass a logger that matches console's interface as an SDK option.

Warning

Beware that debug logging will reveal secrets, like API tokens in headers, in log messages printed to a console or files. It's recommended to use this feature only during local development and not in production.

import { Creem } from "creem";

const sdk = new Creem({ debugLogger: console });
You can also enable a default debug logger by setting an environment variable CREEM_DEBUG to true.

Development
Maturity
This SDK is in beta, and there may be breaking changes between versions without a major version update. Therefore, we recommend pinning usage to a specific package version. This way, you can install the same version each time without breaking changes unless you are intentionally looking for the latest version.

Contributions
While we value open-source contributions to this SDK, this library is generated programmatically. Any manual changes added to internal files will be overwritten on the next generation. We look forward to hearing your feedback. Feel free to open a PR or an issue with a proof of concept and we'll do our best to include it in a future release.

SDK Created by Speakeasy