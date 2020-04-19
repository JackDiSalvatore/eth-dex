pragma solidity ^0.5.0;

import "./Token.sol";
import "openzeppelin-solidity/contracts/math/SafeMath.sol";

contract Exchange {
    using SafeMath for uint;

    address public feeAccount;
    uint256 public feePercent;
    // mapping token to pair of users and their balances
    address constant ETHER = address(0);
    mapping(address => mapping(address => uint256)) public tokens;

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);

    constructor(address _feeAccount, uint256 _feePercent) public {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }

    function balanceOf(address _token, address _user) public view returns (uint256) {
        return tokens[_token][_user];
    }

    // Fallback: reverts if Ether is directly sent to this smart contract
    function() external {
        revert();
    }

    function depositEther() payable public returns (bool success) {
        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].add(msg.value);

        emit Deposit(ETHER, msg.sender, msg.value, tokens[ETHER][msg.sender]);
        return true;
    }

    function withdrawEther(uint _amount) public returns (bool success) {
        require(tokens[ETHER][msg.sender] >= _amount);

        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
        msg.sender.transfer(_amount);   // transfer Ether back to msg.sender

        emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
        return true;
    }

    function depositToken(address _token, uint _amount) public returns (bool success) {
        require(_token != ETHER);
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));
        tokens[_token][msg.sender] = tokens[_token][msg.sender].add(_amount);

        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
        return true;
    }

    function withdrawToken(address _token, uint256 _amount) public returns (bool success) {
        require(_token != ETHER);
        require(tokens[_token][msg.sender] >= _amount);

        tokens[_token][msg.sender] = tokens[_token][msg.sender].sub(_amount);
        require(Token(_token).transfer(msg.sender, _amount)); // transfer Token back to msg.sender

        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
        return true;
    }

}