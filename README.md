Uniform Validation Language
==============

A logic language built specifically to validate web forms, designed to accomplish 3 major goals.

1. Validate a form on the client _and_ server using the same validation logic to improve security and reduce redundancy.
2. Make the creation of online forms simple and intuitive for developers.
3. Improve the user experience for filling out web forms.

```
$ npm install uniform-validation --save
```

Problem
--------------

Web form validation sucks. This can be shown through a very simple example, consider the following form:

![Car Form][car-form]

[car-form]: http://i65.tinypic.com/2vjoj6d.png

This form is asking the user two major questions:

1. Do you have a car?
2. If so, what is it's make, model, and year?

In order to provide a good user experience, this form should validate itself before sending a request to the server. It also makes sense to disable the three text fields when the user does not have a car. This prevents users from inputting their car's information while accidentially stating that they do not own a car. Such a form would probably have a markup similar to:

```html
<form id="carForm" method="POST" action="/submit">
  <input name="hasCar" id="hasCar" type="checkbox" checked="true"/>I have a car
  <div id="subForm">
    Make: <input name="make" id="make" type="text" /><br />
    Model: <input name="model" id="model" type="text" /><br />
    Year: <input name="year" id="year" type="text" />
  </div>
  <button type="submit">Submit</button>
</form>
```

In order to provide the above functionality, some accompanying JavaScript would be required (assuming jQuery).

```javascript
// Enable and disable form based on whether or not the user has a car
$(document).on("click", "#hasCar", function (evt) {
  if (evt.target.checked) {
    $("#subForm :input").attr("disabled", false);
  } else {
    $("#subForm :input").attr("disabled", true);
  }
});

// When the form is submitted, validate it
$(document).on("submit", "#carForm", function (evt) {
  if ($("#hasCar").is(":checked")) { // Only require car info if the user owns a car
    // Validate that the make and model are not empty
    if ($("#make").val() === "" || $("#model").val() === "") {
      alert("Please fill in all the required fields.");
      evt.preventDefault(); // Don't submit form
      return;
    }
    
    // Validate that the year is four digits
    if (!/^[0-9]{4}$/.test($("#year").val())) {
      alert("The year must be exactly four digits.");
      evt.preventDefault();
    }
  }
});
```

This is far more complicated than it needs to be. The requirements can be stated in a single sentence yet it took over twenty lines of JavaScript. This involved five if-statements, two event listeners with lambda functions, and a great deal of understanding of jQuery. The meaningful logic of the form is hidden behind a bunch of JavaScript and jQuery. Even as an experienced web programmer, I made several rookie mistakes and had to perform multiple Google searches drafting this example.

This is just the frontend too; the server must independently validate all requests to ensure data integrity. This means all the validation code needs to be duplicated and rewritten for a different context! There is also the possibility of bugs, such as a case where the client-side says the form is valid and the server-side says it is not. It is impossible to present a good user-experience in such a case.

A form this simple should not be this complicated to implement!
--------------

To address these issues, the Uniform Validation Language was created. It works as a logical architecture rather than an imperative one to simplify validation logic and make it easy to present a strong user experience. The language can also be run on the server-side _as well as_ the client-side, meaning the source code is shared with no need for duplication on the different environments.

Solution
==============

The easiest way to explain how Uniform works is to show an example. Let's take another crack at that form using the same HTML.

car.ufm
--------------

```javascript
// Declare some useful regular expressions
@filled: /./;
@year: /[0-9]{4}/x;

// Declare the form inputs and their types
boolean: hasCar;
string: make;
string: model;
string: year;

// TODO: Should the result tag be used here? I left it out for simplicity.
// We could show its application at the server-side implmentation.

// The entire form is valid if the user does not have a car, or the subform is valid
valid: not hasCar or @mySubForm.valid;

// Define attributes for the subform
@mySubForm {
  // The subform is valid if all its inputs are valid
  valid: make.valid and model.valid and year.valid;
  
  selector: "#subForm"; // This subForm is the $("#subForm") element
  enabled: hasCar; // The subform is enabled only when the user has a car
  
  make {
    valid: make matches @filled; // Valid when it is filled
  }
  
  model {
    valid: model matches @filled; // Valid when it is filled
  }
  
  year {
    valid: year matches @year; // Valid when it is four digits
  }
}
```

This can be used on the client with only two additional lines of code:

```html
<script src="uniform.js"></script> <!-- Include Uniform library -->
<script>uniform.options.href("car.ufm");</script> <!-- Link Uniform code -->
```

Advantages
--------------

1. Readable: The logic and its intent are front and center. There is no programming language complicating the meaning of the actual logic.
2. Self-documenting: The comments above are largely didactic for first time readers. Each line effectively states what it does in simplified English. There is no need for clarifying comments as the code is already clear!
3. Dynamic Forms: The form can easily change its enabled state based on user input. This presents a much more intuitive interface for the user with little to no development overhead!
4. Centralized: Each bit of logic is implemented exactly once and used where necessary. Where JavaScript forces you to duplicate code between the checkbox event and the form validation, Uniform reuses them cleanly and easily. Similarly...
5. Client & Server: The same Uniform code works on both the client _and_ the server. After a quick server-side setup the same Uniform code can be used without fear of security issues!

Server-side Setup
--------------

(Assuming a NodeJS server running the Express framework)

Install the Node module: `$ npm install uniform-validation --save`

```javascript
var validator = require("uniform-validation");

// TODO: Is the client library necessary to state here? It's completely copy-pasteable and is pretty meaningless to the overall point
// I just don't want to put up an incomplete example and perhaps mislead people.

// Expose the client-side library at /uniform.js
app.get("/uniform.js", function (req, res) {
  validator.getClientLib().then(function (lib) {
    res.end(lib);
  });
});

// On a POST request to /submit, validate against car.ufm
app.post("/submit", validator("car.ufm"), function (req, res) {
  res.end("Valid Data!");
}, function (err, req, res, next) {
  res.end("Invalid Data!");
});
```

With only a few lines on the server, all of the Uniform code can be reused to validate against any incoming requests with no customized server logic.

Development
--------------

Take a look at the Wiki for additional documentation and resources.

1. Want to integrate Uniform into your project? See [Getting Started](https://github.com/uniform-team/Uniform-Validation-Language/wiki/Getting-Started). // TODO
2. Want to build the car form yourself from scratch? See our interactive car tutorial Git repository. // TODO
3. Want to get involved? See [How to Contribute](https://github.com/uniform-team/Uniform-Validation-Language/wiki/How-to-Contribute). // TODO
4. Curious about the language specification? See [Language Grammar](https://github.com/uniform-team/Uniform-Validation-Language/wiki/Language-Grammar). // TODO: Update

Uniform is still in active development! We would love to hear your feedback about the language, what you like, what you don't like, what features you want, why you use it, or even why you don't. // TODO: How to contact us.

Future of Uniform
--------------

We're doing our best to keep the issues for this project up-to-date and working through them as best we can. Here is a list of some of the major features we're looking forward to implementing.

1. More controls: Support for drop downs, date fields, number fields, radio buttons, etc.
2. Non-NodeJS servers: Support all the popular server languages and frameworks so they can take advantage of Uniform.
3. Environment: Support user-specific information provided in an environment to avoid ugly metaprogramming.
4. Lists: Support lists of subforms so logic can be shared between each item.

Did we forget your feature? The best way of getting our attention is to simply [file an issue](https://github.com/uniform-team/Uniform-Validation-Language/issues/new) with your brilliant idea.
