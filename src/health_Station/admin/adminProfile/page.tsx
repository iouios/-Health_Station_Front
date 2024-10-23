import React, { useState, useEffect } from "react";
import { useTheme, useMediaQuery } from "@mui/material";
import AdminNavbar from "../../../components/navbarAdmin/adminNavbar";
import AdminSidebar from "../../../components/navbarAdmin/adminSidebar";
import { Link } from "react-router-dom";
import icon from "../../../assets/icon.png";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import axios from "axios";
import * as Yup from "yup";

interface ProfileData {
  username: string;
  firstname: string;
  lastname: string;
  phone: string;
  rolename: string;
  password: string;
}

interface Errors {
  username?: string;
  password?: string;
  firstname?: string;
  lastname?: string;
  rolename?: string;
  phone?: string;
  general?: string;
}

const validationSchema = Yup.object().shape({
  username: Yup.string().required("กรุณากรอกชื่อผู้ใช้งาน*"),
  password: Yup.string()
    .required("กรุณากรอกรหัสผ่าน")
    .min(5, "รหัสผ่านต้องมีความยาวอย่างน้อย 5 ตัวอักษร")
    .matches(/[a-z]/, "รหัสผ่านต้องมีตัวอักษรพิมพ์เล็กอย่างน้อยหนึ่งตัว (a-z)")
    .matches(/[A-Z]/, "รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อยหนึ่งตัว (A-Z)")
    .matches(/[0-9]/, "รหัสผ่านต้องมีตัวเลขอย่างน้อยหนึ่งตัว (0-9)"),
  firstname: Yup.string().required("กรุณากรอกชื่อ"),
  lastname: Yup.string().required("กรุณากรอกนามสกุล"),
  rolename: Yup.string()
    .oneOf(["เจ้าหน้าที่", "อสม"], "กรุณาเลือกบทบาท")
    .required("กรุณาเลือกบทบาท"),
  phone: Yup.string()
    .required("กรุณากรอกเบอร์โทรศัพท์")
    .min(10, "เบอร์โทรต้องมี 10 ตัว"),
});

const AdminProfile: React.FC = () => {
  const [state, setState] = useState();
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const [totalCount, setTotalCount] = useState<number>(0);
  const [profileData, setProfileData] = useState<ProfileData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<any | null>(
    localStorage.getItem("userId")
  );
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<ProfileData[] | null>(null);
  const [errors, setErrors] = useState<Errors>({});
  const requestStatus = "active";
  const status = "active";

  const handleClick = (id: any) => {
    setUserId(id);
  };

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        `http://localhost:9999/api/users/getProfile/${userId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      setProfileData(response.data.Master);
    } catch (err) {
      setError("Failed to load profile");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Check if editValue is not null or undefined
      if (editValue && editValue.length > 0) {
        // Validate the input before submission
        await validationSchema.validate(editValue[0], { abortEarly: false });

        // Determine whether to use PUT based on editValue
        const response = await axios.put(
          `http://localhost:9999/api/users/editProfile/${userId}`,
          {
            ...editValue[0],
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );

        // Check if the response is successful
        if (response.status === 200) {
          console.log("Form Submitted", editValue);
          setErrors({});
          window.location.href = "http://localhost:3000/admin/Proflile";
        }
      } else {
        // Handle the case where editValue is null or empty
        setErrors({ general: "No data to submit." });
      }
    } catch (error) {
      const newErrors: Errors = {};

      // Handle validation errors
      if (error instanceof Yup.ValidationError) {
        error.inner.forEach((err) => {
          if (err.path) newErrors[err.path as keyof Errors] = err.message;
        });
      }
      // Handle API errors
      else if (axios.isAxiosError(error)) {
        if (error.response) {
          console.error("API error:", error.response.data);
          const apiErrors = error.response.data.errors;
          if (apiErrors) {
            Object.keys(apiErrors).forEach((key) => {
              newErrors[key as keyof Errors] = apiErrors[key];
            });
          }
        } else if (error.request) {
          console.error("API error: No response received");
        } else {
          console.error("API error:", error.message);
        }
      }
      // Handle unexpected errors
      else {
        console.error("Unexpected error:", error);
      }

      setErrors(newErrors);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [userId]);

  const hadnleEdit = () => {
    setIsEdit(!isEdit);
  };

  useEffect(() => {
    setEditValue(profileData);
  }, [profileData]);

  const handleClicks = () => {
    window.location.reload();
  };

  return (
    <div className="h-screen">
      <AdminNavbar />
      <div className="flex">
        <div className="grid-rows-1">
          <AdminSidebar />
        </div>
        <div className=" bg-neutral-100 w-full">
          <div className="flex-initial md:bg-white"></div>
          <div className="flex-1 md:bg-neutral-100 ">
            <div className=" md:bg-white md:m-4 bg-white rounded-lg">
              <div className="text-center rounded-md">
                <div className="grid justify-items-end">
                  {/* <div className="">
                    <Link to="/admin/Profile/editprofile">
                      <button className="bg-blue-500 p-1 m-2 rounded-lg text-white ">
                        แก้ไข
                      </button>
                    </Link>
                  </div> */}
                </div>
                <div className="m-2">
                  <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 650 }} aria-label="simple table">
                      <TableHead>
                        <TableRow>
                          <div className="text-center rounded-md">
                            {isEdit ? (
                              <>
                                <div className="flex flex-col w-full p-2 mx-2 justify-start">
                                  <div className="p-4">
                                    <div className="flex justify-end gap-x-2">
            
                                        <button onClick={handleClicks} className="bg-white text-blue-500 border border-blue-500 py-2 px-4 rounded-xl">
                                          ยกเลิก
                                        </button>
                   
                                      <button
                                        onClick={handleSubmit}
                                        className="bg-blue-500 text-white py-2 px-4 rounded-xl"
                                      >
                                        บันทึก
                                      </button>
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2">
                                    <div>
                                      <div className="p-2 text-start">
                                        ชื่อผู้ใช้งาน
                                      </div>
                                      <div className="p-2">
                                        <input
                                          type="text"
                                          name="username"
                                          id=""
                                          className="border-2 border-b-4 flex-1 text-left p-2 bg-gray-100 w-full"
                                          value={editValue?.[0]?.username || ""} // Optional chaining to avoid errors
                                          onChange={(e) => {
                                            // Ensure you're updating the correct object in the array
                                            setEditValue((prevState) => {
                                              if (!prevState) return prevState; // Handle null case

                                              const updatedProfile = [
                                                ...prevState,
                                              ]; // Clone the previous state array
                                              updatedProfile[0] = {
                                                // Assume you're updating the first profile object
                                                ...updatedProfile[0],
                                                username: e.target.value, // Update the username field
                                              };

                                              return updatedProfile; // Return the updated array
                                            });
                                          }}
                                        />
                                      </div>
                                      {errors.username && (
                                        <div className="text-red-500 text-sm mt-1">
                                          {errors.username}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex flex-col">
                                      <div className="p-2 text-start">
                                        รหัสผ่าน
                                      </div>
                                      <div className="p-2">
                                        <input
                                          type="password" // Changed input type to password for security
                                          name="password"
                                          className="border-2 border-b-4 flex-1 text-left p-2 bg-gray-100 w-full"
                                          value={editValue?.[0]?.password || ""} // Optional chaining and fallback for undefined value
                                          onChange={(e) => {
                                            setEditValue((prevState) => {
                                              if (!prevState) return prevState; // Handle null/undefined case

                                              const updatedProfile = [
                                                ...prevState,
                                              ]; // Clone the previous state array
                                              updatedProfile[0] = {
                                                ...updatedProfile[0],
                                                password: e.target.value, // Update the password field
                                              };

                                              return updatedProfile; // Return the updated array
                                            });
                                          }}
                                        />
                                      </div>
                                      {errors.password && (
                                        <div className="text-red-500 text-sm mt-1">
                                          {errors.password}
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="grid grid-cols-2">
                                    <div className="">
                                      <div className="pl-2 text-start">
                                        first name
                                      </div>
                                      <div className="p-2">
                                        <input
                                          type="text"
                                          name="firstname"
                                          id=""
                                          className="border-2 border-b-4 flex-1 text-left p-2 bg-gray-100 w-full"
                                          value={
                                            editValue?.[0]?.firstname || ""
                                          } // Optional chaining to avoid errors
                                          onChange={(e) => {
                                            // Ensure you're updating the correct object in the array
                                            setEditValue((prevState) => {
                                              if (!prevState) return prevState; // Handle null case

                                              const updatedProfile = [
                                                ...prevState,
                                              ]; // Clone the previous state array
                                              updatedProfile[0] = {
                                                // Assume you're updating the first profile object
                                                ...updatedProfile[0],
                                                firstname: e.target.value, // Update the username field
                                              };

                                              return updatedProfile; // Return the updated array
                                            });
                                          }}
                                        />
                                      </div>
                                      {errors.firstname && (
                                        <div className="text-red-500 text-sm mt-1">
                                          {errors.firstname}
                                        </div>
                                      )}
                                    </div>
                                    <div className="flex flex-col">
                                      <div className="pl-2 text-start">
                                        last name
                                      </div>
                                      <div className="p-2">
                                        <input
                                          type="text"
                                          name="lastname"
                                          id=""
                                          className="border-2 border-b-4 flex-1 text-left p-2 bg-gray-100 w-full"
                                          value={editValue?.[0]?.lastname || ""} // Optional chaining to avoid errors
                                          onChange={(e) => {
                                            // Ensure you're updating the correct object in the array
                                            setEditValue((prevState) => {
                                              if (!prevState) return prevState; // Handle null case

                                              const updatedProfile = [
                                                ...prevState,
                                              ]; // Clone the previous state array
                                              updatedProfile[0] = {
                                                // Assume you're updating the first profile object
                                                ...updatedProfile[0],
                                                lastname: e.target.value, // Update the username field
                                              };

                                              return updatedProfile; // Return the updated array
                                            });
                                          }}
                                        />
                                      </div>
                                      {errors.lastname && (
                                        <div className="text-red-500 text-sm mt-1">
                                          {errors.lastname}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex flex-col">
                                    <div className="p-2 text-start">phone</div>
                                    <div className="p-2">
                                      <input
                                        type="text"
                                        name="username"
                                        id=""
                                        className="border-2 border-b-4 flex-1 text-left p-2 bg-gray-100 w-full"
                                        value={editValue?.[0]?.phone || ""} // Optional chaining to avoid errors
                                        onChange={(e) => {
                                          // Ensure you're updating the correct object in the array
                                          setEditValue((prevState) => {
                                            if (!prevState) return prevState; // Handle null case

                                            const updatedProfile = [
                                              ...prevState,
                                            ]; // Clone the previous state array
                                            updatedProfile[0] = {
                                              // Assume you're updating the first profile object
                                              ...updatedProfile[0],
                                              phone: e.target.value, // Update the username field
                                            };

                                            return updatedProfile; // Return the updated array
                                          });
                                        }}
                                      />
                                    </div>
                                    {errors.phone && (
                                      <div className="text-red-500 text-sm mt-1">
                                        {errors.phone}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex flex-col">
                                    <div className="p-2 text-start">บทบาท</div>
                                    <div className="p-2">
                                      <select
                                        name="บทบาท"
                                        className="border-2 border-b-4 flex-1 text-left p-2 bg-gray-100 w-full"
                                        value={editValue?.[0]?.rolename || ""}
                                        onChange={(e) => {
                                          console.log(
                                            "Selected Role:",
                                            e.target.value
                                          );
                                          setEditValue((prevState) => {
                                            if (!prevState) return prevState; // Handle null case
                                            const updatedProfile = [
                                              ...prevState,
                                            ]; // Clone the previous state array
                                            updatedProfile[0] = {
                                              ...updatedProfile[0],
                                              rolename: e.target.value, // Update the rolename field
                                            };
                                            return updatedProfile; // Return the updated array
                                          });
                                        }}
                                      >
                                        <option value="">บทบาท</option>
                                        <option value="เจ้าหน้าที่">
                                          เจ้าหน้าที่
                                        </option>
                                        <option value="อสม">อสม</option>
                                      </select>
                                    </div>
                                    {errors.rolename && (
                                      <div className="text-red-500 text-sm mt-1">
                                        {errors.rolename}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </>
                            ) : (
                              <div className="">
                                <div className="grid justify-items-end p-2">
                                  <button
                                    className="bg-blue-500 p-2 rounded-md text-white"
                                    onClick={() => hadnleEdit()}
                                  >
                                    แก้ไข
                                  </button>
                                </div>
                                <div className="m-2 mt-4">
                                  <TableContainer component={Paper}>
                                    <Table
                                      sx={{ minWidth: 650 }}
                                      aria-label="simple table"
                                    >
                                      <TableHead>
                                        <TableRow>
                                          <div>
                                            {profileData &&
                                            profileData.length > 0 ? (
                                              <div className="flex">
                                                <TableCell className="flex-1">
                                                  <div>ชื่อผู้ใช้งาน</div>
                                                  <div>ชื่อ</div>
                                                  <div>นามสกุล</div>
                                                  <div>บทบาท</div>
                                                  <div>เบอร์โทรศัพท์</div>
                                                </TableCell>
                                                <TableCell>
                                                  <div className="flex flex-col text-end">
                                                    <div>
                                                      {profileData[0].username}
                                                    </div>
                                                    <div>
                                                      {profileData[0].firstname}
                                                    </div>
                                                    <div>
                                                      {profileData[0].lastname}
                                                    </div>
                                                    <div>
                                                      {profileData[0].rolename}
                                                    </div>
                                                    <div>
                                                      {profileData[0].phone}
                                                    </div>
                                                  </div>
                                                </TableCell>
                                              </div>
                                            ) : (
                                              <div>
                                                <p>ยังไม่มีข้อมูล</p>
                                                <p>{userId}</p>
                                              </div>
                                            )}
                                          </div>
                                        </TableRow>
                                      </TableHead>
                                    </Table>
                                  </TableContainer>
                                </div>
                              </div>
                            )}
                          </div>
                        </TableRow>
                      </TableHead>
                    </Table>
                  </TableContainer>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
