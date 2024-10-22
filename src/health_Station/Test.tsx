import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

import TableRow from '@mui/material/TableRow'; // ตรวจสอบให้แน่ใจว่าได้ติดตั้ง Material-UI
import TableContainer from '@mui/material/TableContainer'; // ตรวจสอบให้แน่ใจว่าได้ติดตั้ง Material-UI
import Paper from '@mui/material/Paper'; // ตรวจสอบให้แน่ใจว่าได้ติดตั้ง Material-UI
import Table from '@mui/material/Table'; // ตรวจสอบให้แน่ใจว่าได้ติดตั้ง Material-UI
import TableHead from '@mui/material/TableHead'; // ตรวจสอบให้แน่ใจว่าได้ติดตั้ง Material-UI
import TableBody from '@mui/material/TableBody'; // ตรวจสอบให้แน่ใจว่าได้ติดตั้ง Material-UI
import TableCell from '@mui/material/TableCell'; // ตรวจสอบให้แน่ใจว่าได้ติดตั้ง Material-UI

interface Data {
  id: number;
  firstname: string;
  lastname: string;
  rolename: string;
}

interface ProfileData {
  id: number;
  statusmaster: string;
  username: string;
  firstname: string;
  lastname: string;
  rolename: string;
  phone: string;
}

interface StatusMaster {
  id: number;
  firstname: string;
  lastname: string;
  rolename: string;
  statusmaster: string;
}

interface ApiResponse {
  countallMaster: number;
}

const Profile: React.FC = () => {
  const [data, setData] = useState<Data[]>([]);
  const [profileData, setProfileData] = useState<ProfileData[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [status, setStatus] = useState<StatusMaster[]>([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<ProfileData[] | null>(null);
  const [master, setMaster] = useState<boolean>(false);
  const [searchQuerys, setSearchQuerys] = useState<string>('');
  const [finalResult, setFinalResult] = useState<Data[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [countallMaster, setCountallMaster] = useState<number | null>(null);

  // Handle search functionality
  useEffect(() => {
    if (searchQuerys === '') {
      setFinalResult(data);
    } else {
      const filteredQuery = data.filter((datas) => {
        return Object.values(datas).some((value) =>
          value.toString().toLowerCase().includes(searchQuerys.toLowerCase())
        );
      });
      setFinalResult(filteredQuery);
    }
  }, [searchQuerys, data]);

  const handleClick = (id: number) => {
    setUserId(id);
    setSelectedId(id);
  };

  const openPopup = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  const handleEditToggle = () => {
    setIsEdit((prev) => !prev);
  };

  const handleConfirm = () => {
    setIsPopupOpen(false);
  };

  const fetchAllMaster = async () => {
    try {
      const response = await axios.get(`http://localhost:9999/api/users/allMaster`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      setData(response.data.allMaster);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
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
    if (editValue && editValue[0]) {
      console.log("Submitting:", editValue[0]); // ตรวจสอบค่าที่จะส่ง

      try {
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

        if (response.status === 200) {
          console.log("Form Submitted", response.data); // ตรวจสอบการตอบสนอง
          await fetchProfile(); // โหลดข้อมูลใหม่
          setIsEdit(false); // ปิดโหมดแก้ไข
        }
      } catch (err) {
        
        setError("ไม่สามารถบันทึกข้อมูลได้"); // เปลี่ยนข้อความผิดพลาด
      }
    } else {
      setError("editValue ยังไม่ได้อัปเดต");
    }
  };

  // Fetch all master data
  useEffect(() => {
    fetchAllMaster();
  }, []);

  // Fetch profile data when userId changes
  useEffect(() => {
    if (userId) {
      fetchProfile();
    }
  }, [userId]);

  // Update editValue when profileData changes
  useEffect(() => {
    setEditValue(profileData);
  }, [profileData]);

  return(
    <div className="h-screen">
      
      <div className="grid grid-cols-[1fr_4fr] gap-4">
        <div className="flex">
          
        </div>
        <div className="p-6">
          <div className="bg-white flex">
            <div className="bg-neutral-100 w-full">
              <div className="m-4 bg-white">
                <div className="p-5">
                  <div className="text-center rounded-md">
                    {isEdit ? (
                      <>
                        <div className="flex flex-col w-full mx-2 justify-start">
                          <div className="">
                            <div className="flex justify-end gap-x-2">
                              <button
                                className="bg-white text-blue-500 border border-blue-500 py-2 px-4 rounded-xl"
                                onClick={() => setIsEdit(false)} // ปิดโหมดแก้ไข
                              >
                                ยกเลิก
                              </button>
                              <button
                                onClick={handleSubmit}
                                className="bg-blue-600 text-white py-2 px-4 rounded-xl"
                              >
                                บันทึก
                              </button>
                            </div>
                            <div className="p-2 text-start">ชื่อผู้ใช้งาน</div>
                            <div className="p-2">
                              <input
                                type="text"
                                name="username"
                                className="border-2 border-b-4 flex-1 text-left p-2 bg-gray-100 w-full"
                                value={editValue?.[0]?.username || ""}
                                onChange={(e) => {
                                  setEditValue((prevState) => {
                                    if (!prevState) return prevState;
                                    const updatedProfile = [...prevState];
                                    updatedProfile[0] = {
                                      ...updatedProfile[0],
                                      username: e.target.value,
                                    };
                                    return updatedProfile;
                                  });
                                }}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2">
                            <div className="pl-2 text-start">first name</div>
                            <div className="pl-2 text-start">last name</div>
                          </div>
                          <div className="flex flex-col">
                            <div className="p-2 text-start">บทบาท</div>
                            <div className="p-2">
                              <select
                                name="บทบาท"
                                className="border-2 border-b-4 flex-1 text-left p-2 bg-gray-100 w-full"
                                value={editValue?.[0]?.rolename || ""}
                                onChange={(e) => {
                                  setEditValue((prevState) => {
                                    if (!prevState) return prevState;
                                    const updatedProfile = [...prevState];
                                    updatedProfile[0] = {
                                      ...updatedProfile[0],
                                      rolename: e.target.value,
                                    };
                                    return updatedProfile;
                                  });
                                }}
                              >
                                <option value="">บทบาท</option>
                                <option value="เจ้าหน้าที่">เจ้าหน้าที่</option>
                                <option value="อสม">อสม</option>
                              </select>
                            </div>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="">
                        <div className="grid justify-items-end ">
                          <button
                            className="bg-blue-600 p-2 rounded-md text-white"
                            onClick={() => setIsEdit(true)} // เปิดโหมดแก้ไข
                          >
                            แก้ไข
                          </button>
                        </div>
                        {/* แสดงข้อความผิดพลาด */}
                        {error && (
                          <div className="text-red-500 mt-2">{error}</div>
                        )}
                        {/* โค้ดที่เหลือของคุณ */}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
