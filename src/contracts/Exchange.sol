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
    mapping(uint256 => _Order) public orders;
    mapping(uint256 => bool) public orderCancelled;
    mapping(uint256 => bool) public orderFilled;
    uint256 public orderCount;

    event Deposit(address token, address user, uint256 amount, uint256 balance);
    event Withdraw(address token, address user, uint256 amount, uint256 balance);
    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Cancel(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );
    event Trade(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address userFill,
        uint256 timestamp
    );

    struct _Order {
        uint256 id;
        address user;
        address tokenGet;
        uint256 amountGet;
        address tokenGive;
        uint256 amountGive;
        uint256 timestamp;
    }

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

    function withdrawEther(uint256 _amount) public returns (bool success) {
        require(tokens[ETHER][msg.sender] >= _amount);

        tokens[ETHER][msg.sender] = tokens[ETHER][msg.sender].sub(_amount);
        msg.sender.transfer(_amount);   // transfer Ether back to msg.sender

        emit Withdraw(ETHER, msg.sender, _amount, tokens[ETHER][msg.sender]);
        return true;
    }

    function depositToken(address _token, uint256 _amount) public returns (bool success) {
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

    function makeOrder(address _tokenGet, uint256 _amountGet, address _tokenGive, uint256 _amountGive) public returns (bool success) {
        orderCount = orderCount.add(1);
        orders[orderCount] = _Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);

        emit Order(orderCount, msg.sender, _tokenGet, _amountGet, _tokenGive, _amountGive, now);
        return true;
    }

    function cancelOrder(uint256 _id) public returns (bool success) {
        _Order storage _order = orders[_id];
        require(address(_order.user) == msg.sender);
        require(_order.id == _id);

        orderCancelled[_id] = true;

        emit Cancel(_order.id, msg.sender, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, now);
        return true;
    }

    function fillOrder(uint256 _id) public returns (bool success) {
        require(_id > 0 && _id <= orderCount);
        require(!orderCancelled[_id]);
        require(!orderFilled[_id]);

        _Order storage _order = orders[_id];
        _trade(_order);

        orderFilled[_order.id] = true;
        return true;
    }

    function _trade(_Order storage _order) internal {
        uint256 feeAmount = _order.amountGive.mul(feePercent).div(100);
        // take feeAmount out of amountGet
        uint256 amountGetWithFee = _order.amountGet.add(feeAmount);
        uint256 amountGet = _order.amountGet;
        uint256 amountGive = _order.amountGive;

        // perspective of _order.user filling the order
        // _order.user will increase their balance by amountGet
        //    therefore, msg.sender will subtract amountGet from their balance
        // _order.user will decrease their balance by amountGive
        //    since this is what they are "giving"
        //    msg.sender will increase there balance by amountGive

        // add amountGive to sender
        tokens[_order.tokenGive][msg.sender] = tokens[_order.tokenGive][msg.sender].add(amountGive);
        // subtract amountGet from sender
        tokens[_order.tokenGet][msg.sender] = tokens[_order.tokenGet][msg.sender].sub(amountGetWithFee);

        // add amountGet to order user
        tokens[_order.tokenGet][_order.user] = tokens[_order.tokenGet][_order.user].add(amountGet);
        // subtract amountGive from order user
        tokens[_order.tokenGive][_order.user] = tokens[_order.tokenGive][_order.user].sub(amountGive);

        // add feeAmount (in tokenGet) to feeAccount
        tokens[_order.tokenGet][feeAccount] = tokens[_order.tokenGet][feeAccount].add(feeAmount);

        emit Trade(_order.id, _order.user, _order.tokenGet, _order.amountGet, _order.tokenGive, _order.amountGive, msg.sender, now);
    }

}