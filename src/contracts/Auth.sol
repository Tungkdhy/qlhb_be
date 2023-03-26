pragma solidity ^0.5.0;
contract Auth {
    uint public authCount;
    string public name;
    mapping (uint =>User) public users;
    struct User{
        uint id;
        address addUser;
        string role;
    }
    event createUser(
        uint id,
        address payable addUser,
        string role
    );
    constructor () public{
        name = "Auth";
    }
    function addUser(string memory _role) public{
        
        authCount++;
        users[authCount] = User(authCount,msg.sender,_role);
        emit createUser(authCount,msg.sender,_role);
    }
      function getRole(address add) public view returns (string memory) {
        for(uint i = 1; i <= authCount; i++){
        if(users[i].addUser == add) {
            return users[i].role;
        }
    }
    }
}