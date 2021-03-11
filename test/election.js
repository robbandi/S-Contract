var Hands = artifacts.require("./Hands.sol");

contract("Hands", function(accounts) {
  var handsInstance;

  it("initializes with two fingers", function() {
    return Hands.deployed().then(function(instance) {
      return instance.candidatesCount();
    }).then(function(count) {
      assert.equal(count, 2);
    });
  });

  it("it initializes the fingers with the correct values", function() {
    return Hands.deployed().then(function(instance) {
      handsInstance = instance;
      return handsInstance.fingers(1);
    }).then(function(Arm) {
      assert.equal(Arm[0], 1, "contains the correct id");
      assert.equal(Arm[1], "Arm 1", "contains the correct name");
      assert.equal(Arm[2], 0, "contains the correct votes count");
      return handsInstance.fingers(2);
    }).then(function(Arm) {
      assert.equal(Arm[0], 2, "contains the correct id");
      assert.equal(Arm[1], "Arm 2", "contains the correct name");
      assert.equal(Arm[2], 0, "contains the correct votes count");
    });
  });

  it("allows a voter to cast a vote", function() {
    return Hands.deployed().then(function(instance) {
      handsInstance = instance;
      candidateId = 1;
      return handsInstance.vote(candidateId, { from: accounts[0] });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "an event was triggered");
      assert.equal(receipt.logs[0].event, "votedEvent", "the event type is correct");
      assert.equal(receipt.logs[0].args._candidateId.toNumber(), candidateId, "the Arm id is correct");
      return handsInstance.voters(accounts[0]);
    }).then(function(voted) {
      assert(voted, "the voter was marked as voted");
      return handsInstance.fingers(candidateId);
    }).then(function(Arm) {
      var voteCount = Arm[2];
      assert.equal(voteCount, 1, "increments the Arm's vote count");
    })
  });

  it("throws an exception for invalid candiates", function() {
    return Hands.deployed().then(function(instance) {
      handsInstance = instance;
      return handsInstance.vote(99, { from: accounts[1] })
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return handsInstance.fingers(1);
    }).then(function(candidate1) {
      var voteCount = candidate1[2];
      assert.equal(voteCount, 1, "Arm 1 did not receive any votes");
      return handsInstance.fingers(2);
    }).then(function(candidate2) {
      var voteCount = candidate2[2];
      assert.equal(voteCount, 0, "Arm 2 did not receive any votes");
    });
  });

  it("throws an exception for double voting", function() {
    return Hands.deployed().then(function(instance) {
      handsInstance = instance;
      candidateId = 2;
      handsInstance.vote(candidateId, { from: accounts[1] });
      return handsInstance.fingers(candidateId);
    }).then(function(Arm) {
      var voteCount = Arm[2];
      assert.equal(voteCount, 1, "accepts first vote");
      // Try to vote again
      return handsInstance.vote(candidateId, { from: accounts[1] });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return handsInstance.fingers(1);
    }).then(function(candidate1) {
      var voteCount = candidate1[2];
      assert.equal(voteCount, 1, "Arm 1 did not receive any votes");
      return handsInstance.fingers(2);
    }).then(function(candidate2) {
      var voteCount = candidate2[2];
      assert.equal(voteCount, 1, "Arm 2 did not receive any votes");
    });
  });
});
