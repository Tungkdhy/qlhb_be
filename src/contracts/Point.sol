pragma solidity >=0.4.21 <0.6.0;
pragma experimental ABIEncoderV2;
contract Transcript{
    string public name;
    uint public pointCount = 0;
    mapping (uint=>Point) public points;
    Point[] public listPoint;
    struct Point {
        uint id;
        string idTeacher;
        string idStudent;
        //uint id;
        string idSubject;
        // string nameSubject;
        ComponentPoint point;
        address payable author;
       

    }
    struct ComponentPoint{
        uint mouth;
        uint minute;
        uint end;
        uint frequent;
    }
    event PointCreated(
        uint id,
        string idTeacher,
        string idStudent,
        string idSubject,
        ComponentPoint point,
        address payable author
    );
       event PointChange(
        uint id,
        string idTeacher,
        string idStudent,
        string idSubject,
        ComponentPoint point,
        address payable author
    );
    
    constructor() public {
        name = "Ponint";
    }
    function mark(string memory _idTeacher, string memory _idStudent,string memory _isSubject,ComponentPoint memory _point ) public{
        require(msg.sender!=address(0));
        pointCount++;
        points[pointCount] = Point(pointCount,_idTeacher,_idStudent,_isSubject,_point,msg.sender);
        emit PointCreated(pointCount,_idTeacher,_idStudent,_isSubject,_point,msg.sender);
    }
    function changePoint(uint _id , ComponentPoint memory _point) public{
        require(_id > 0 && _id <= pointCount);
        Point memory pnt = points[_id];
        pnt.point = _point;
        points[_id] = pnt;
        emit PointChange(_id,pnt.idTeacher,pnt.idStudent,pnt.idSubject,pnt.point,pnt.author);
    }


} 