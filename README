https://github.com/Propolandante/119proj

ATTENTION: The local files WILL NOT LOAD IN GOOGLE CHROME, because Chrome doesn't support multi-file
web applications unless they are hosted over HTTP. Please use Firefox.

This week we are submitting both Phase I and Phase II of our Visual Genome User Interface design. 
Ideally, Phase I would be released first, where users are only labelling the objects in each image. 
This data is collected from thousands of submissions to form a unified set of object labels for each 
image. While we haven't implemented any canonicalization solutions in our project yet, we have some 
ideas for tackling it.

Users in Phase I click on an object in the image that they would like to label, and they are prompted 
with a text box right where they clicked. As they type in the label for the object, they are presented 
with label suggestions based on the letters they have typed so far. These suggestions can either be 
object names that the user has already submitted while labelling this image, or suggestions from a set 
of common objects that we have included. The user is still free to type whatever label they would like, 
but we feel that these suggestions will aid canonicalization as well as help avoid typos. By hovering 
over a pin, the user can see what the object's label is. To get rid of a pin, the user can Shift+click 
the pin, or drag it off of the image for disposal. Data from each pin (coordinates, name, unique id) 
are stored in a JSON data structure. We spent a long time trying to get communication with a web 
server to host this data, but we were unable to fully accomplish that by this week. We expect that 
this will be done by Friday. In our current build, the data is lost as soon as the user exits the 
web application. The user can click the Next Image button to continue through the ten images provided.

Users in Phase II are presented with an already-labelled image, and are tasked with identifying 
the relationships between the objects in the image. This is done by clicking and dragging a red 
arrow from one object pin to another. When the user does this they are asked to label the relationship 
between the objects. As with the object-labelling, the user is provided with auto-complete suggestions 
as they type. The relationships can be seen when the user hovers their mouse over an object, to reveal 
it's name as well as its relationships to any other objects in the image. Because these are directed 
relationships, the UI is not cluttered by the labels from two objects acting upon each other. 
Currently, our Phase II example only works with the one image provided.

NEW THIS WEEK (Improvements and Bug fixes)

    Added a backdrop to text labels in Phase I to make text easier to view
    Added color coded pins to Phase I
    Added minimum required number of object labels (arbitrarily set to 5 currently) for Phase I
    Added dynamic tooltips and instructions to Phase I

KNOWN BUGS / PLANNED TWEAKS

    It is possible to create more than one relationship from one object to another. This causes overlapping and looks ugly.
    When hovering over an object in Phase II, it displays the object's name, and it's relationships to other objects, but not the names of the objects it is acting upon.
    The overall look of the webpage is pretty flat and boring. We wanted to spend some time to make it more appealing looking, but all of that time went into attempting to set up an AWS server to host JSON data.
    Users are able to draw multiple relationships without typing a label for them, clogging up the screen.
    The description for Phase II is kind of vague to anyone not familiar with the project.
    The Next Image button is broken in Phase II. THis is because there is only one image right now.

We welcome any feedback!