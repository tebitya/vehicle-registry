
/*function to display the different options with actions to be made to database*/
function access_option() {
    var option = document.getElementById("menu");
    var option_val = option.value;
    if (option_val) {
      window.location.href = option_val;
    }
}

/* search bar where name is entered*/
/* search bar where registration plate is entered*/
const name_query = document.getElementById("name"); 
const registration_query = document.getElementById("license"); 

/* for the vehicle search page */
const vehicle_query= document.getElementById("rego");


/* setting up connection with database through API*/
/* setting up connection with database through API*/
async function fetchProducts() {
    try{
        const response = await fetch(
            "https://ftyrivkbhylnvefawxcu.supabase.co/rest/v1/People?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0eXJpdmtiaHlsbnZlZmF3eGN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIwNjI0ODQsImV4cCI6MjAyNzYzODQ4NH0.u8WrVsxWF_E6AbDkLA2qo1uD7RijIVIIdu6QrV0SHqo"
        );
    
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);  
        }
        const data = await response.json();
        
        return data;
    }catch(error){
        console.error("Error fetching data: ",error);
        return [];
    }
}

async function fetchVehicle() {
    try{
        const response = await fetch(
            "https://ftyrivkbhylnvefawxcu.supabase.co/rest/v1/Vehicles?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0eXJpdmtiaHlsbnZlZmF3eGN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIwNjI0ODQsImV4cCI6MjAyNzYzODQ4NH0.u8WrVsxWF_E6AbDkLA2qo1uD7RijIVIIdu6QrV0SHqo"
        );
    
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
    
        const vehicles_data = await response.json();

        const people_response= await fetch(`https://ftyrivkbhylnvefawxcu.supabase.co/rest/v1/People?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0eXJpdmtiaHlsbnZlZmF3eGN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIwNjI0ODQsImV4cCI6MjAyNzYzODQ4NH0.u8WrVsxWF_E6AbDkLA2qo1uD7RijIVIIdu6QrV0SHqo`);
        if (!people_response.ok) {
            throw new Error(`HTTP error: ${people_response.status}`);
        }

        people_data = await people_response.json();
        

        const joined_data= vehicles_data.map(vehicles=>{
            const people_row= people_data.find(people_row=>people_row.PersonID==vehicles.OwnerID);
            return { ...vehicles, Name: people_row?.Name};
        });
        return joined_data;

    }catch(error){
        console.error("Error fetching data: ",error);
        return [];
    }
}

/* now to display these results onto the html page */
/* for the people search page */

function displayResults(results){
    let display= "";
    results.forEach(result=> {
        display += `<div class= "result">`;
        display += `<p>PersonID: ${result.PersonID }</p>`;
        display += `<p>, Name: ${result.Name } </p>`;
        display += `<p>, Address: ${result.Address } </p>`;
        display += `<p>, DOB: ${result.DOB } </p>`;
        display += `<p>, License Number: ${result.LicenseNumber }</p>`;
        display += `<p>, Expiry Date: ${result.ExpiryDate }</p>`;
        display += `</div>`;
    });
    return display;
}


/*to display whether search was successful or not*/
function displayMessage(message){
    const msg=document.getElementById("message");
    msg.textContent=message;
}


/* for the vehicle search page */
function searchVehicles(data,rego){
    const rego_input= rego.toLowerCase().trim();
    return data.filter(vehicle=> vehicle.VehicleID.toLowerCase().includes(rego_input));
}

function displayResultsV(results){
    let display= "";
    results.forEach(result=> {
        display += `<div class= "results">`;
        display += `<p>Make: ${result.Make }</p>`;
        display += `<p>, Model: ${result.Model } </p>`;
        display += `<p>, Colour: ${result.Colour } </p>`;
        display += `<p>, Owner Name: ${result.Name||'Unknown' } </p>`;
        display += `<p>, License Number: ${result.VehicleID }</p>`;
        display += `</div>`;
    });
    return display;
}

// THIS IS FOR VEHICLE-SEARCH-PAGE
document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("rego_button")?.addEventListener("click", async function(event) {
        event.preventDefault();
        const rego_input= document.getElementById("rego").value.trim();

        if (rego_input) {
            const data= await fetchVehicle();
            const vehicle= searchVehicles(data, rego_input);
            if (vehicle.length>0) {
                const display_data = displayResultsV(vehicle);
                displayMessage("Search Successful");
                document.getElementById("results").innerHTML = display_data;
            } else {
                displayMessage("No result found");
                document.getElementById("results").innerHTML = "";
            }
        } else {
            displayMessage("Error");
        }
    });
});

// THIS IS FOR PEOPLE-SEARCH-PAGE
/* People search- search by driver name */
/*to ensure name is returned despite lower or upper case*/
function searchForName(data,name){
    const name_input= name.toLowerCase().trim();
    return data.filter(person=> person.Name.toLowerCase().includes(name_input));
}  

/*to ensure name is returned despite lower or upper case*/
function searchForRegistration(data,registration){
    const registration_input= registration.toLowerCase().trim();
    return data.filter(person=> person.LicenseNumber.toLowerCase().includes(registration_input));
} 

document.addEventListener("DOMContentLoaded", function() {
    // Accessing elements after the DOM content has loaded
    const searchButton= document.getElementById("search_button");

    // Add event listener for the name_button
    if(searchButton){
        searchButton.addEventListener("click", async function(event) {
            event.preventDefault();

            const name_input = document.getElementById("name").value.trim();
            const registration_input = document.getElementById("license").value.trim();

            if (name_input && registration_input) {
                displayMessage("Error");
            } else {
                if (name_input) {
                    const data = await fetchProducts();
                    const person = searchForName(data, name_input);
                    if (person.length > 0) {
                        const display_data = displayResults(person);
                        displayMessage("Search Successful");
                        document.getElementById("results").innerHTML = display_data;
                    } else {
                        displayMessage("No result found");
                        document.getElementById("results").innerHTML = "";
                    }
                }else if(registration_input){
                    const data = await fetchProducts();
                    const vehicle = searchForRegistration(data, registration_input);

                    if (vehicle.length > 0) {
                        const display_data = displayResults(vehicle);
                        displayMessage("Search Successful");
                        document.getElementById("results").innerHTML = display_data;
                    } else {
                        displayMessage("No result found");
                        document.getElementById("results").innerHTML = "";
                    }
                }else {
                    displayMessage("Error");
                    document.getElementById("results").innerHTML = "";
                }
            }
       });
    }
});


// ADDING NEW VEHICLE
document.getElementById("add_vehicle_button")?.addEventListener("click",async function(event){
    event.preventDefault();

    const rego= document.getElementById("rego").value.trim();
    const make = document.getElementById("make").value.trim();
    const model = document.getElementById("model").value.trim();
    const colour = document.getElementById("colour").value.trim();
    const owner = document.getElementById("owner").value.trim();

    if(rego&&make&&model&&colour&&owner){
        const new_vehicle= await insertVehicle(rego,make,model,colour,owner);

        if(new_vehicle){
            displayMessage("Vehicle added successfully");
        }else{
            displayMessage("Error");
        }
    }else{
        displayMessage("Error");
    }

});

async function insertVehicle(rego,make,model,colour,owner) {
    try {
        const people_response = await fetch("https://ftyrivkbhylnvefawxcu.supabase.co/rest/v1/People?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0eXJpdmtiaHlsbnZlZmF3eGN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIwNjI0ODQsImV4cCI6MjAyNzYzODQ4NH0.u8WrVsxWF_E6AbDkLA2qo1uD7RijIVIIdu6QrV0SHqo");
        
        if (!people_response.ok) {
            throw new Error(`Error fetching data: ${people_response.status}`);
        }
        const people_data= await people_response.json();
        const owner_exists = people_data.find(person => person.Name.toLowerCase() === owner.toLowerCase());

        if(owner_exists){
            const response = await fetch("https://ftyrivkbhylnvefawxcu.supabase.co/rest/v1/Vehicles?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0eXJpdmtiaHlsbnZlZmF3eGN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIwNjI0ODQsImV4cCI6MjAyNzYzODQ4NH0.u8WrVsxWF_E6AbDkLA2qo1uD7RijIVIIdu6QrV0SHqo", {
                method: 'POST',
                headers: {
                    'Content-Type':'application/json'
                },
        
                body: JSON.stringify({
                    VehicleID: rego,
                    Make: make,
                    Model: model,
                    Colour: colour,
                    OwnerID: owner_exists.PersonID
                })
            });
        
            if(!response.ok){
                console.error("Error adding vehicle");
                return false;
            }else{
                console.log("Success");
                return true;
            }

        }else{
            document.getElementById("register_vehicle").style.display = "none";
            document.getElementById("new_owner").style.display = "block";
            return true;
        }
            
    } catch (error){
        console.error("Error registering vehicle: ", error.message);
        return false;
    }
}

// for CREATING NEW OWNER & THEN ADDING THEIR NEW VEHICLE IN
document.getElementById("add_owner_button")?.addEventListener("click",async function(event){
    event.preventDefault();

    const personid= document.getElementById("personid").value.trim();
    const name= document.getElementById("name").value.trim();
    const address = document.getElementById("address").value.trim();
    const dob = document.getElementById("dob").value.trim();
    const license = document.getElementById("license").value.trim();
    const expire = document.getElementById("expire").value.trim();

    if(personid&&name&&address&&dob&&license&&expire){
        const add_new= await addOwner(personid,name,address,dob,license,expire);

        if(add_new==true){
            const rego= document.getElementById("rego").value.trim();
            const make = document.getElementById("make").value.trim();
            const model = document.getElementById("model").value.trim();
            const colour = document.getElementById("colour").value.trim();
            const owner= document.getElementById("owner").value.trim();;

            if(rego&&make&&model&&colour&&owner){
                const new_vehicle= await insertVehicle(rego,make,model,colour,owner);
                if(new_vehicle){
                    displayMessage("Vehicle added successfully");
                }else{
                    displayMessage("Error");
                }
            }else{
                displayMessage("Error");
            }
        }else{
            displayMessage("Error");
        }
    }else{
        displayMessage("Error");
    }
});

async function addOwner(personid,name,address,dob,license,expire) {
    try{
        const people_response = await fetch("https://ftyrivkbhylnvefawxcu.supabase.co/rest/v1/People?apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0eXJpdmtiaHlsbnZlZmF3eGN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIwNjI0ODQsImV4cCI6MjAyNzYzODQ4NH0.u8WrVsxWF_E6AbDkLA2qo1uD7RijIVIIdu6QrV0SHqo",{

        method: 'POST',
                headers:{
                    'Content-Type':'application/json'
                },
        
                body: JSON.stringify({
                    PersonID: personid,
                    Name: name,
                    Address: address,
                    DOB: dob,
                    LicenseNumber: license,
                    ExpiryDate: expire
                })
            });

            if(!people_response.ok){
                displayMessage("Error");
                return true;
            }else{
                displayMessage("Success");
                return true;
            } 
    }catch(error){
        displayMessage("Error");
        return false;
    }
}