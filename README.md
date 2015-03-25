tmtracker
=========

Uses the Twitter and Guardian APIs to collect data relating to a search term or brand name, passes the term through a sentiment module to decide if the reference was positive or negative, and also runs the data through the DataTXT api so you can see the context in which the search term was being referenced.

The information is displayed as a graph and grouped by source and DataTXT category.
It also sends out text alerts using twilio if there is a lot of negativity detected.

Tech: NodeJS, MongoDB, Github, Twitter API (streaming and rest), Guardian API, Sentiment node module, DataTxt API, D3.js library, Twiliio

test
