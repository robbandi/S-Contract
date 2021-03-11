pragma solidity >=0.5.0 <0.8.0;

contract Hands {
    // Model a Arm
    struct Arm {
        uint id;
        string name;
        uint voteCount;
    }

    // Store accounts that have voted
    mapping(address => bool) public voters;
    // Store fingers
    // Fetch Arm
    mapping(uint => Arm) public fingers;
    // Store fingers Count
    uint public armsCount;

    // voted event
    event votedEvent (
        uint indexed _ArmId
    );

    constructor () public {
        addArm("Red");
        addArm("Blue");
        addArm("Green");
        addArm("Orange");
    }

    function addArm (string memory _name) private {
        armsCount ++;
        fingers[armsCount] = Arm(armsCount, _name, 0);
    }

    function vote (uint _ArmId) public {
        // require that they haven't voted before
        require(!voters[msg.sender]);

        // require a valid Arm
        require(_ArmId > 0 && _ArmId <= armsCount);

        // record that voter has voted
        voters[msg.sender] = true;

        // update Arm vote Count
        fingers[_ArmId].voteCount ++;

        // trigger voted event
        emit votedEvent(_ArmId);
    }
}
