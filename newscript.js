import { createClient } from 
'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supa_client= createClient('https://ftyrivkbhylnvefawxcu.supabase.co','eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ0eXJpdmtiaHlsbnZlZmF3eGN1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTIwNjI0ODQsImV4cCI6MjAyNzYzODQ4NH0.u8WrVsxWF_E6AbDkLA2qo1uD7RijIVIIdu6QrV0SHqo')

/*function to display the different options with actions to be made to database*/
function access_option() {
    var option = document.getElementById("menu");
    var option_val = option.value;
    if (option_val) {
      window.location.href = option_val;
    }
}

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

async function searchPeople(name, license){
    try{
        let name_data=[];
        let license_data=[];

        if(name){
            const{data: name_result, error:name_error}= await supa_client
            .from('People')
            .select('*')
            .ilike('Name',`%${name}%`);

            if(name_error){
                console.error("Error fetching data: ",name_error);
            }

            name_data= name_result||[];
        }

        if(license){
            const{data: license_result, error:license_error}= await supa_client
            .from('People')
            .select('*')
            .ilike('LicenseNumber',`%${license}%`);

            if(license_error){
                console.error("Error fetching data: ",license_error);
            }

            license_data= license_result||[];
        }
        return [...name_data,...license_data];

    }catch(error){
        console.error("Error fetching data: ",error);
        return [];
    }
}

// for people search page
document.addEventListener("DOMContentLoaded", function() {
    const searchButton= document?.getElementById("search_button");
    if(searchButton){
        searchButton.addEventListener("click", async function(event) {
            event.preventDefault();

            const name_input = document.getElementById("name").value.trim();
            const registration_input = document.getElementById("license").value.trim();

            if (name_input && registration_input) {
                displayMessage("Error");
            } else {
                try{
                    let search_data;
                    if(name_input&&!registration_input){
                        search_data= await searchPeople(name_input,null);
                        displayResults(search_data);
                    }else if(!name_input&&registration_input){
                        search_data= await searchPeople(null,registration_input);
                        displayResults(search_data);
                    }else{
                        displayMessage("Error");
                        return;
                    }

                    if(search_data&&search_data.length>0){
                        const display_data= displayResults(search_data);
                        displayMessage("Search successful");
                        document.getElementById("results").innerHTML = display_data;
                    }else{
                        document.getElementById("results").innerHTML = "";
                        displayMessage("No result found");
                    }
                }catch(error){
                    console.log("Error fetching data: ",error);
                    displayMessage("Error");
                }
            }
        })
    }
});


// THIS IS FOR VEHICLE-SEARCH-PAGE
async function searchVehicle(registration){
    try{
        const{data: vehicle_result, error:vehicle_error}= await supa_client
        .from('Vehicles')
        .select('*')
        .ilike('VehicleID',`%${registration}%`);

        if(vehicle_error){
            console.error("Error fetching data: ",vehicle_error);
            return [];
        }
        
        const vehicle=vehicle_result[0];

        if(!vehicle.OwnerID){
            return[vehicle,null];
        }

        // fetching ownerid
        const{data: owner_result, error:owner_error}= await supa_client
        .from('People')
        .select('*')
        .eq('PersonID',vehicle.OwnerID);

        if(owner_error){
            console.error("Error fetching data: ",owner_error);
            return [];
        }

        const owner= owner_result[0]||null;

        return [vehicle,owner];

    }catch(error){
        console.error("Error fetching data: ",error);
        return [];
    }
}

function displayVehicle(vehicle, person){
    let display="";

    display+=`<div class= "results">`;
    display += `<p>Make: ${vehicle.Make }</p>`;
    display += `<p>, Model: ${vehicle.Model } </p>`;
    display += `<p>, Colour: ${vehicle.Colour } </p>`;
    if(person){
        display += `<p>, Owner: ${person.Name } </p>`;
    }else{
        display += `<p>, Owner: Null </p>`;
    }
    
    display += `<p>, License Number: ${vehicle.VehicleID }</p>`;
    display += `</div>`;

    return display;
}


document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("rego_button")?.addEventListener("click", async function(event) {
        event.preventDefault();
        const rego_input= document.getElementById("rego").value.trim();

        try{
            let search_data;

            if(rego_input){
                search_data= await searchVehicle(rego_input);
                console.log(search_data);
            }else{
                displayMessage("Error");
                return;
            }

            if(search_data&&search_data.length>0){
                const display_data= displayVehicle(search_data[0],search_data[1]);
                displayMessage("Search successful");
                document.getElementById("results").innerHTML = display_data;
            }else{
                document.getElementById("results").innerHTML = "";
                displayMessage("No result found");
            }

        }catch(error){
            console.log("Error fetching data: ",error);
            displayMessage("Error");
        }
    });
});


// for registering-vehicle
async function insertVehicle(rego,make,model,colour,owner) {
    try {
        const {data: owner_results, error: owner_error}=await supa_client
        .from('People')
        .select('*')
        .ilike('Name',`%${owner}%`);
        
        if(owner_error){
            console.error("Error fetching data: ",name_error);
        }

        let ownerid;
        if(owner_results.length>0){
            ownerid= owner_results[0].PersonID;
        }else{
            document.getElementById("register_vehicle").style.display = "none";
            document.getElementById("new_owner").style.display = "block";
            return;
        }

        const {data: insert_result, error: insert_error}= await supa_client
            .from('Vehicles')
            .insert([
                {
                    VehicleID:rego,
                    Make:make,
                    Model:model,
                    Colour: colour,
                    OwnerID: ownerid
                }
            ]);
        
        if(insert_error){
            console.error("Error fetching data: ",insert_error);
        }
        console.log("worked");
        return true;
    }catch(error){
        console.error("Error registering vehicle: ",error);
        return false;
    }
}


// ADDING NEW VEHICLE
document.getElementById("add_vehicle_button")?.addEventListener("click",async function(event){
    event.preventDefault();

    const rego= document.getElementById("rego").value.trim();
    const make= document.getElementById("make").value.trim();
    const model= document.getElementById("model").value.trim();
    const colour= document.getElementById("colour").value.trim();
    const owner= document.getElementById("owner").value.trim();

    if(rego&&make&&model&&colour&&owner){
        const new_vehicle= await insertVehicle(rego,make,model,colour,owner);
        console.log(new_vehicle);
        if(new_vehicle){
            displayMessage("Vehicle added successfully");
        }else{
            displayMessage("Error");
        }
    }else{
        displayMessage("Error");
    }

});


// for CREATING NEW OWNER & THEN ADDING THEIR NEW VEHICLE IN
document.getElementById("add_owner_button")?.addEventListener("click",async function(event){
    event.preventDefault();

    const personid= document.getElementById("personid").value.trim();
    const name= document.getElementById("name").value.trim();
    const address= document.getElementById("address").value.trim();
    const dob= document.getElementById("dob").value.trim();
    const license= document.getElementById("license").value.trim();
    const expire= document.getElementById("expire").value.trim();

    if(personid&&name&&address&&dob&&license&&expire){
        try{
            const{data: new_owner, error: owner_error}= await supa_client
                .from('People')
                .insert([
                {
                    PersonID: personid,
                    Name: name,
                    Address: address,
                    DOB: dob,
                    LicenseNumber: license,
                    ExpiryDate: expire
                }
                ]);
            
            if(owner_error){
                console.error("Error fetching data: ",owner_error);
            }

            console.log("new owner added well");

            const rego= document.getElementById("rego").value.trim();
            const make= document.getElementById("make").value.trim();
            const model= document.getElementById("model").value.trim();
            const colour= document.getElementById("colour").value.trim();
            const owner= document.getElementById("owner").value.trim();

            const new_vehicle= await insertVehicle(rego,make,model,colour,name);

            if(new_vehicle){
                displayMessage("Vehicle added successfully");
            }else{
                displayMessage("Error");
            }

        }catch(error){
            console.log("Error adding new owner",error);
            displayMessage("Error");
        }
    }else{
        displayMessage("Error");
    }
});