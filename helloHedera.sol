// SPDX-Licence-Identifier: GPL-3.0
pragma solidity ^0.8.13;

contract HelloHedera {

    function hello(string memory name) public pure returns(string memory) {
        return string(abi.encodePacked("hello ", name));
    }

}
