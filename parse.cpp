/*

	quick .csv to .json parsing/formatting program

*/

#include <iostream>
#include <fstream>
#include <string>
#include <sstream>
#include <time.h>

using namespace std;

const int YEAR = 400;
const int NUM_SATS = 1500;


struct satellite{
	string name;
	string countryUn;
	string countryOperator;
	string owner;
	string users;
	string purpose;
	string detailedPurpose;
	string classOfOrbit;
	string typeOfOrbit;
	string longitude;
	string perigree;
	string apogee;
	string eccentricity;
	string inclination;
	string period;
	string launchMass;
	string dryMass;
	string power;
	string dateOfLaunch;
	string expectedLifetime;
	string contractor;
	string countryOfContractor;
	string launchSite;
	string launchVehicle;
	string COSPAR;
	string NORAD;
	string Comments;
	string sourceData;
	string source1;
	string source2;
	string source3;
	string source4;
	string source5;
	string source6;
};

satellite findSubjects(string);

int main(){
	string line;
	int index = 0;
	
	string startDates[YEAR];
	string endDates[YEAR];
	
	int startDateIndex = 0;
	int endDateIndex = 0;
	
	bool startStart = true;
	bool endStart = true;

	
	satellite satellites[NUM_SATS];
	
	for(int i = 0; i < NUM_SATS; i++){
		satellites[i].name = "\0";
	}
	
	ifstream myfile ("UCS_Satellite_Database_7-1-16.txt");

	
	satellite data;
	
	if(myfile.is_open()){
		getline(myfile, line);
		
		while( getline(myfile, line)){
//			getline(myfile, line);
			if(line.length() > 0){
				data = findSubjects(line);
				
				satellites[index] = data;

				index ++;
			}	
		}
	}
	else{
		cout << "Fail infile" << endl;
	}
	
	myfile.close();
	
	
	
	
	
	
	
	
	

	
	
	
	
	
	
	
	
	ofstream outfile("satellitedata.json");
	
	bool start = true;
	
	if(outfile.is_open()){

		outfile <<"[";
		for(int i = 0; i < NUM_SATS && satellites[i+1].name.compare("\0") != 0; i ++){

			if(!start){
				outfile << "," << endl;	
			}
			else{
				start = false;
			}
			
			outfile << "{";
			outfile << "\"name\":" << satellites[i].name << ", " << endl;
//			outfile << "\"countryUn\":" << satellites[i].countryUn << ", " << endl;
			outfile << "\"countryOperator\":" << satellites[i].countryOperator << ", " << endl;
//			outfile << "\"owner\":" << satellites[i].owner << ", " << endl;
			outfile << "\"users\":" << satellites[i].users << ", " << endl;
			outfile << "\"purpose\":" << satellites[i].purpose << ", " << endl;
			outfile << "\"detailedPurpose\":" << satellites[i].detailedPurpose << ", " << endl;
//			outfile << "\"classOfOrbit\":" << satellites[i].classOfOrbit << ", " << endl;
//			outfile << "\"typeOfOrbit\":" << satellites[i].typeOfOrbit << ", " << endl;
//			outfile << "\"longitude\":" << satellites[i].longitude << ", " << endl;
			outfile << "\"perigree\":" << satellites[i].perigree << ", " << endl;
			outfile << "\"apogee\":" << satellites[i].apogee << ", " << endl;
//			outfile << "\"eccentricity\":" << satellites[i].eccentricity << ", " << endl;
//			outfile << "\"inclination\":" << satellites[i].inclination << ", " << endl;
//			outfile << "\"period\":" << satellites[i].period << ", " << endl;
//			outfile << "\"launchMass\":" << satellites[i].launchMass << ", " << endl;
//			outfile << "\"dryMass\":" << satellites[i].dryMass << ", " << endl;
//			outfile << "\"power\":" << satellites[i].power << ", " << endl;
//			outfile << "\"dateOfLaunch\":" << satellites[i].dateOfLaunch << ", " << endl;
//			outfile << "\"expectedLifetime\":" << satellites[i].expectedLifetime << ", " << endl;
//			outfile << "\"contractor\":" << satellites[i].contractor << ", " << endl;
//			outfile << "\"countryOfContractor\":" << satellites[i].countryOfContractor << ", " << endl;
//			outfile << "\"launchSite\":" << satellites[i].launchSite << ", " << endl;
			outfile << "\"launchVehicle\":" << satellites[i].launchVehicle << endl;
//			outfile << "\"COSPAR\":" << satellites[i].COSPAR << ", " << endl;
//			outfile << "\"NORAD\":" << satellites[i].NORAD << ", " << endl;
//			outfile << "\"Comments\":" << satellites[i].Comments << ", " << endl;
//			outfile << "\"sourceData\":" << satellites[i].sourceData << ", " << endl;
//			outfile << "\"source1\":" << satellites[i].source1 << ", " << endl;
//			outfile << "\"source2\":" << satellites[i].source2 << ", " << endl;
//			outfile << "\"source3\":" << satellites[i].source3 << ", " << endl;
//			outfile << "\"source4\":" << satellites[i].source4 << ", " << endl;
//			outfile << "\"source5\":" << satellites[i].source5 << ", " << endl;
//			outfile << "\"source6\":" << satellites[i].source6 << endl;
			outfile << "}";

		}
		outfile << "]";
	}
	else{
		cout << "Fail outfile" << endl;
	}
	
	outfile.close();
	
//	printStations(stations);
	
	return 0;
}

satellite findSubjects(string line){

	satellite result;
	stringstream ss(line);
	
	string substr;


	getline( ss, substr, '\t');
	
	for(int i = substr.length(); i >= 0; i --){
		if(substr[i] == '"'){
			substr.erase(i, 1);
		}
	}
	
	if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.name = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.countryUn = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.countryOperator = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.owner = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.users = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.purpose = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.detailedPurpose = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.classOfOrbit = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.typeOfOrbit = substr;
	
	getline( ss, substr, '\t'); for(int i = substr.length(); i >= 0; i --){if(substr[i] == '"' || substr[i] == ','){substr.erase(i, 1);}}; if(substr.empty()){substr = "\"\"";}
	result.longitude = substr;
	
	getline( ss, substr, '\t'); for(int i = substr.length(); i >= 0; i --){if(substr[i] == '"' || substr[i] == ','){substr.erase(i, 1);}}; if(substr.empty()){substr = "\"\"";}
	result.perigree = substr;
	
	getline( ss, substr, '\t'); for(int i = substr.length(); i >= 0; i --){if(substr[i] == '"' || substr[i] == ','){substr.erase(i, 1);}}; if(substr.empty()){substr = "\"\"";}
	result.apogee = substr;
	
	getline( ss, substr, '\t'); for(int i = substr.length(); i >= 0; i --){if(substr[i] == '"' || substr[i] == ','){substr.erase(i, 1);}}; if(substr.empty()){substr = "\"\"";}
	result.eccentricity = substr;
	
	getline( ss, substr, '\t'); for(int i = substr.length(); i >= 0; i --){if(substr[i] == '"' || substr[i] == ','){substr.erase(i, 1);}}; if(substr.empty()){substr = "\"\"";}
	result.inclination = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.period = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.launchMass = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.dryMass = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.power = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.dateOfLaunch = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.expectedLifetime = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.contractor = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.countryOfContractor = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.launchSite = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.launchVehicle = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.COSPAR = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.NORAD = substr;
	
	getline( ss, substr, '\t');
	
	
	for(int i = substr.length(); i >= 0; i --){
		if(substr[i] == '"'){
			substr.erase(i, 1);
		}
	}

	if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.Comments = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.sourceData = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.source1 = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.source2 = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.source3 = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.source4 = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.source5 = substr;
	
	getline( ss, substr, '\t'); if(substr[0] != '"'){ substr.insert(0, "\""); substr.append("\""); };
	result.source6 = substr;

	return result;
}


