// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

contract Migrations {
    address public owner;
    uint256 public last_completed_migration;

    event MigrationCompleted(uint256 completed);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    constructor() payable{
        owner = msg.sender;
    }

    function setCompleted(uint256 completed) public onlyOwner {
        if (last_completed_migration != completed) {
            last_completed_migration = completed;
            emit MigrationCompleted(completed);
        }
    }
}
