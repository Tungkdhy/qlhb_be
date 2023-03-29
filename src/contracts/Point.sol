pragma solidity >=0.4.21 <0.6.0;
pragma experimental ABIEncoderV2;
contract Transcript{
    string public name;
    uint public pointCount = 0;
    mapping (uint=>Point) public points;
    Point[] public listPoint;
    struct Point {
        uint id;
        uint idTeacher;
        uint idStudent;
        string year;
        string semester;
        //uint id;
        uint idSubject;
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
        uint idTeacher,
        uint idStudent,
        uint idSubject,
        ComponentPoint point,
        address payable author,
         string year,
        string semester
    );
       event PointChange(
        uint id,
        uint idTeacher,
        uint idStudent,
        uint idSubject,
        ComponentPoint point,
        address payable author,
         string year,
        string semester
    );
    
    constructor() public {
        name = "Ponint";
    }
    function mark(uint  _idTeacher, uint  _idStudent,uint  _isSubject,ComponentPoint memory _point,string memory _year,string memory _semester ) public{
        require(msg.sender!=address(0));
        pointCount++;
        points[pointCount] = Point(pointCount,_idTeacher,_idStudent,_year,_semester,_isSubject,_point,msg.sender);
        emit PointCreated(pointCount,_idTeacher,_idStudent,_isSubject,_point,msg.sender,_year,_semester);
    }
    function changePoint(uint _id , ComponentPoint memory _point) public{
        require(_id > 0 && _id <= pointCount);
        Point memory pnt = points[_id];
        pnt.point = _point;
        points[_id] = pnt;
        emit PointChange(_id,pnt.idTeacher,pnt.idStudent,pnt.idSubject,pnt.point,pnt.author,pnt.year,pnt.semester);
    }
    function getPointByIdStudent(uint _idStudent) public view returns (Point [] memory){
        
        uint counter = 0;
        uint index = 0;
        for (uint i = 0; i <= pointCount; i++) {
            if (points[i].idStudent ==_idStudent) {
                counter++;
            }
        }
           Point [] memory pointStudent = new Point[](counter);
          for (uint i = 0; i <= pointCount; i++) {
            if (points[i].idStudent == _idStudent) {
                pointStudent[index]=points[i];
                index++;
            }
        }
        return pointStudent;
    }
     function getPointByIdSubject(uint _idSubject) public view returns (Point [] memory){
        
        uint counter = 0;
        uint index = 0;
        for (uint i = 0; i <= pointCount; i++) {
            if (points[i].idSubject ==_idSubject) {
                counter++;
            }
        }
           Point [] memory pointSubject = new Point[](counter);
          for (uint i = 0; i <= pointCount; i++) {
            if (points[i].idSubject == _idSubject) {
                pointSubject[index]=points[i];
                index++;
            }
        }
        return pointSubject;
    }

} 