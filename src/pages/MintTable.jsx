import { useSelector } from "react-redux";
import { getUserMintedTimeApi, mintApi, updateUserMintedTimeApi, userDetailsApi, } from "../utils/api/apiFunctions";
import { toast } from "react-toastify";
import { useEffect, useState } from "react";

const MintTable = () => {
  const stateData = useSelector((state)=>state?.wallet?.dataObject)
  const [userDataApi, setUserDataApi] = useState({});

    const handldeMintFunc=async()=>{
      
      const lastMintTime = await getUserMintedTimeApi(stateData?.token);
  const currentDate = new Date().toISOString().split('T')[0]; // Get current date in 'YYYY-MM-DD' format

  // Check if lastMintTime?.data is a valid date
  const isValidDate = (date) => {
    return !isNaN(new Date(date).getTime()); // Returns true if valid date, false otherwise
  };

  let lastMintDate = null;

  if (lastMintTime?.data && isValidDate(lastMintTime.data)) {
    lastMintDate = new Date(lastMintTime.data).toISOString().split('T')[0]; // Convert last mint date to 'YYYY-MM-DD'
  }

  if (lastMintDate && currentDate === lastMintDate) {
    toast.error("You can't mint more than once per day.");
    return;
  }
      
      const mintApiData = await mintApi(stateData?.walletAddress);
      console.log(mintApiData);

      const signedTransaction = await window.pox.signdata(
        mintApiData?.data?.transaction
      );

      console.log("signedTransaction: ", signedTransaction);

      const broadcast = JSON.stringify(
        await window.pox.broadcast(JSON.parse(signedTransaction[1]))
      );

      console.log("broadcast", broadcast);

      // update user mint time
      const updateMintedUserData = await updateUserMintedTimeApi(stateData?.token);
      console.log("updateMintedUserData: ", updateMintedUserData);

      toast.success("Minted successfully.")
    }

    useEffect(()=>{
      const fetchData = async()=>{
        const userDataApi = await userDetailsApi(stateData?.walletAddress);
        console.log("userDataApi: ", userDataApi)
        setUserDataApi(userDataApi?.data); // Set user data to state variable
      }

      fetchData();
    },[])
  
    return (
      <div className=" p-6">
        <div className="overflow-x-auto">
          <table className="min-w-full bg-transparent text-gray-300 rounded-lg shadow-lg">
            <thead>
              <tr className="text-left text-sm uppercase border-b-2 border-[#313133]">
                <th className="py-4 px-6">Cycle</th>
                <th className="py-4 px-6 text-center">Amount</th>
                <th className="py-4 px-6 text-center">Interest 30%</th>
                <th className="py-4 px-6 text-center">Total Earnings</th>
                <th className="py-4 px-6 text-center">Invest Date</th>
                <th className="py-4 px-6 text-center">Maturity Days</th>
                <th className="py-4 px-6 text-right">Mint Reward</th>
              </tr>
            </thead>
            <tbody>
              {/* border-b border-[#313133] */}
                <tr className="border-none hover:bg-[#2C2C2E] transition-all bg-transparent">
                  <td className="py-4 px-6">1</td>
                  <td className="py-4 px-6 text-center">{userDataApi?.depositAmount ? userDataApi?.depositAmount :0}</td>
                  <td className="py-4 px-6 text-center">{userDataApi?.depositAmount ? (userDataApi.depositAmount * 0.3).toFixed(2) : 0}</td>
                  <td className="py-4 px-6 text-center">{userDataApi?.totalReward ? userDataApi?.totalReward : 0}</td>
                  <td className="py-4 px-6 text-center">{userDataApi?.startTime ? new Date(userDataApi.startTime * 1000).toLocaleDateString('en-GB') : 0}</td>
                  <td className="py-4 px-6 text-center">  {userDataApi?.cycleCount ? `${userDataApi.mintCount}/30` : 0}</td>
                  <td className="py-4 px-6 text-right">
                      <button
                      onClick={handldeMintFunc}
                       className="bg-[linear-gradient(to_right,#FFE27A,#FFBA57,#98DB7C,#8BCAFF)] text-black font-bold py-2 px-8 rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-300">
                        Mint
                      </button>
                  </td>
                </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  export default MintTable;
  