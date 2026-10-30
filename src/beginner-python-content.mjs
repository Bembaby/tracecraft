const sources=[{title:'Python numbers and text',url:'https://docs.python.org/3/tutorial/introduction.html'}];
export const PYTHON_VALUE_DRILLS=[
  {id:'first-total',level:'beginner',title:'Add two named values',topic:'Variables · numbers · addition',
    prompt:'The starter has 3 apples and 2 oranges. Create a variable named total that adds apples and oranges. Then display total. Keep the two starting lines.',
    contract:'This program takes no typed input. apples starts at 3 and oranges starts at 2. Keep those values unchanged. Store their sum in total and print exactly 5 followed by one line break, with no extra output.',
    starter:'apples = 3\noranges = 2\n# Add the two values and display the total.\n',
    solution:'apples = 3\noranges = 2\ntotal = apples + oranges\nprint(total)\n',bug:'apples = 3\noranges = 2\ntotal = "apples + oranges"\nprint(total)\n',
    tests:'import sys\nassert apples == 3 and oranges == 2, "Keep the two starting values."\nassert total == 5, "total should be the number 5. Use the variable names without quotes."\nassert sys.stdout.getvalue() == "5\\n", "Display total once with print(total)."',
    explanation:'The equals sign stores a value under a name. apples + oranges reads the two stored numbers and adds them. Quoting the expression would make it text, so Python would display the words instead of calculating. print(total) displays the number stored in total.',
    complexity:'O(1) time and O(1) space for these fixed, small numbers: two values and one addition.',
    fixtures:[{label:'Numeric result',assertion:'total is the integer 5, not text.'},{label:'Starting data preserved',assertion:'apples is 3 and oranges is 2.'},{label:'Exact output',assertion:'Only 5 and its final line break are displayed.'}],
    hints:['Use total = apples + oranges to name the result of an addition.','print(total) displays the value stored under that name. Do not put total in quotation marks.'],sources},
  {id:'first-greeting',level:'beginner',title:'Join two pieces of text',topic:'Strings · text joining',
    prompt:'The starter stores Amina in name. Create a variable named greeting containing Hello, Amina! by joining "Hello, ", name, and "!". Display greeting once.',
    contract:'No typed input. Keep name equal to the string Amina. greeting must be the string Hello, Amina! with one space after the comma. Print that greeting followed by a single line break. Do not print extra spaces, quotes, or lines.',
    starter:'name = "Amina"\n# Build greeting from text and name, then display it.\n',solution:'name = "Amina"\ngreeting = "Hello, " + name + "!"\nprint(greeting)\n',bug:'name = "Amina"\ngreeting = "Hello," + name + "!"\nprint(greeting)\n',
    tests:'import sys\nassert name == "Amina", "Keep the supplied name."\nassert greeting == "Hello, Amina!", "Include the comma, one space, the name, and the exclamation mark."\nassert sys.stdout.getvalue() == "Hello, Amina!\\n", "Display greeting once."',
    explanation:'A string is text. The + operator joins strings in order. The space in "Hello, " is real text and becomes part of the result. The variable name is unquoted because you want its stored value, Amina, rather than the word name.',
    complexity:'For this fixed greeting the work and space are bounded: O(1). Joining arbitrary strings takes time and result space proportional to the total text length.',
    fixtures:[{label:'Text value',assertion:'greeting includes the name and punctuation.'},{label:'Space boundary',assertion:'There is one space between the comma and Amina.'},{label:'No quotes in output',assertion:'The output contains no source-code quotation marks or extra lines.'}],
    hints:['Keep name outside quotation marks when combining it with other strings.','The pieces are "Hello, ", name, and "!". Join them with +.'],sources}
];

export const PYTHON_VALUE_LESSONS=[
  {id:'values-and-variables',track:'python',title:'Remember a value with a variable',outcome:'Store a number, read it, and calculate with it.',
    why:'Programs often need to remember something: a price, a score, or how many items are available. A variable gives a value a name. Python reads these instructions from top to bottom.',
    terms:[['Variable','A name you use to refer to a value.'],['Assignment (=)','Store the value on the right under the name on the left.'],['Integer','A whole number such as 0, 4, or -2.'],['Expression','Code that calculates or produces a value.']],
    sections:[{title:'Give a number a name',body:'tickets = 4 stores the number 4 under the name tickets. You can display that stored number with print(tickets). Do not quote tickets: print("tickets") displays the word instead.',code:'tickets = 4\nprint(tickets)',result:'4'},
    {title:'Use the stored value in a calculation',body:'The + symbol adds numbers. Python reads tickets, adds 2, and stores the result under a new name. The original tickets value is still 4.',code:'tickets = 4\nnew_total = tickets + 2\nprint(new_total)\nprint(tickets)',result:'6\n4'},
    {title:'Replace a stored value',body:'You can assign a new value to the same name. The right side is calculated before Python stores the result. This equals sign is an instruction to store something, not a mathematical claim that 4 equals 6.',code:'tickets = 4\ntickets = tickets + 2\nprint(tickets)',result:'6'}],
    task:{type:'python',id:'first-total'},practice:'Add two named numbers and display their total. The starter gives you the numbers; you write the calculation.',recap:'Explain why print(total) and print("total") display different things.'},
  {id:'text-and-numbers',track:'python',title:'Work with text and numbers',outcome:'Tell a string from a number and join text.',
    why:'A program might calculate a price and display a greeting. Numbers are for arithmetic. Strings are for text. Knowing which kind of value you have prevents confusing results.',
    terms:[['String','A sequence of text characters, written in matching quotes.'],['Type','The kind of a value, such as an integer or a string.'],['Join text','Combine strings into a longer string.'],['str(...)','Convert a value into text.']],
    sections:[{title:'Quotes change the meaning',body:'6 is a number, but "6" is text. Adding numbers calculates a total. Adding strings joins their characters. The printed results below look different even though both examples use +.',code:'print(6 + 2)\nprint("6" + "2")',result:'8\n62'},
    {title:'Spaces belong inside the text',body:'Python does not invent a space between joined strings. Include the space inside your quotation marks. Names like person are unquoted when you want the stored value.',code:'person = "Omar"\nmessage = "Hi, " + person + "."\nprint(message)',result:'Hi, Omar.'},
    {title:'Convert a number before joining it to text',body:'Python cannot directly add a string and an integer. str converts a value into text for joining. The original numeric value stays a number.',code:'score = 8\nprint("Score: " + str(score))',result:'Score: 8'}],
    task:{type:'python',id:'first-greeting'},practice:'Build and display a greeting using a stored name. Watch the space after the comma.',recap:'What changes when you put quotes around a number or a variable name?'}
];
