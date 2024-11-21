import './reports.css';
import React, {
    useEffect,
    useRef,
    useState,
  } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Column } from 'primereact/column';
import { DataTable } from 'primereact/datatable';
import { Bar } from 'react-chartjs-2';
import 'chart.js/auto';


const Reports = () => {
  const [statistics, setStatistics] = useState({
    total: 0,
    accepted: 0,
    declined: 0,
  });

  const pdfRef = useRef();
  const [modules, setModules] = useState(0);
  const [moduleCopies, setModuleCopies] = useState(0);
  const [officeForms, setOfficeForms] = useState(0);
  const [officeCopies, setOfficeCopies] = useState(0);
  const [exams, setExams] = useState(0);
  const [examCopies, setExamCopies] = useState(0);
  const [manuals, setManuals] = useState(0);
  const [manualCopies, setManualCopies] = useState(0);
  const [dates, setDates] = useState('week');
  
  const [values, setValues] = useState([
      {
          'fileType' : 'Module',
          'number': modules,
          'copies' : moduleCopies}
      ,{
          'fileType' : 'Office Form',
          'number' : officeForms,
          'copies' : officeCopies}
      ,{
          'fileType' : 'Exam',
          'number' : exams,
          'copies' : examCopies}
      ,{
          'fileType' : 'Manual',
          'number' : manuals,
          'copies' : manualCopies
      }
  ]);

  const handleDays = (event) => {
      setDates(event.target.value);
  }

  const downloadReport = () => {
      const input = pdfRef.current;
      html2canvas(input).then((canvas) =>{
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF('l', 'mm', 'a4', true);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = pdf.internal.pageSize.getHeight();
          const imgWidth = canvas.width;
          const imgHeight = canvas.height;
          const ratio = Math.min(pdfWidth/imgWidth, pdfHeight/imgHeight);
          const imgX = (pdfWidth - imgWidth * ratio)/ 2;
          const imgY = 0;
          pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight*ratio);
          pdf.save('System Report.pdf');
      })
  }
    
  const renderHeader = () => {
        return (
            <div id="historyHeader" className="flex">
                <h1>System Report & User Statistics</h1>
                <select id = 'days' onChange={(e) => handleDays(e)}>
                          <option value='week' >Last 7 Days</option>
                          <option value='2week' >Last 14 Days</option>
                          <option value='3week' >Last 21 Days</option>
                          <option value='month' >Last 30 Days</option>
                          <option value='2month' >Last 60 Days</option>
                </select>
            </div>
        );
    };

  const header = renderHeader();

  useEffect(() => {
    const date = new Date();
    if (dates === 'week') {
        date.setDate(date.getDate() - 7);
    } else if (dates === '2week') {
        date.setDate(date.getDate() - 14);
    } else if (dates === '3week') {
        date.setDate(date.getDate() - 21);
    } else if (dates === 'month') {
        date.setDate(date.getDate() - 30);
    } else if (dates === '2month') {
        date.setDate(date.getDate() - 60);
    }

    const requestOptions = {
        method: 'GET',
        mode: 'cors',
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Create an array of fetch promises
    const fetchPromises = [
        fetch(`http://localhost:8080/records/getModules?dates=${date.toISOString().substring(0, 10)}`, requestOptions).then(response => response.json()).then(data => setModules(data)),
        fetch(`http://localhost:8080/requests/getModuleCopies?dates=${date.toISOString().substring(0, 10)}`, requestOptions).then(response => response.json()).then(data => setModuleCopies(data)),
        fetch(`http://localhost:8080/records/getOfficeForms?dates=${date.toISOString().substring(0, 10)}`, requestOptions).then(response => response.json()).then(data => setOfficeForms(data)),
        fetch(`http://localhost:8080/requests/getOfficeFormCopies?dates=${date.toISOString().substring(0, 10)}`, requestOptions).then(response => response.json()).then(data => setOfficeCopies(data)),
        fetch(`http://localhost:8080/records/getExams?dates=${date.toISOString().substring(0, 10)}`, requestOptions).then(response => response.json()).then(data => setExams(data)),
        fetch(`http://localhost:8080/requests/getExamCopies?dates=${date.toISOString().substring(0, 10)}`, requestOptions).then(response => response.json()).then(data => setExamCopies(data)),
        fetch(`http://localhost:8080/records/getManuals?dates=${date.toISOString().substring(0, 10)}`, requestOptions).then(response => response.json()).then(data => setManuals(data)),
        fetch(`http://localhost:8080/requests/getManualCopies?dates=${date.toISOString().substring(0, 10)}`, requestOptions).then(response => response.json()).then(data => setManualCopies(data)),
    ];

    // Wait for all fetch promises to complete
    Promise.all(fetchPromises)
        .then(() => {
            setValues([
                {
                    fileType: 'Module',
                    number: modules,
                    copies: moduleCopies,
                },
                {
                    fileType: 'Office Form',
                    number: officeForms,
                    copies: officeCopies,
                },
                {
                    fileType: 'Exam',
                    number: exams,
                    copies: examCopies,
                },
                {
                    fileType: 'Manual',
                    number: manuals,
                    copies: manualCopies,
                },
            ]);
        })
        .catch(error => {
            console.log(error);
        });
}, [dates]); // Removed unnecessary dependencies to avoid re-fetching on every change


  useEffect(() => {
    fetch("http://localhost:8080/services/statistics") 
      .then((response) => response.json())
      .then((data) => {
        setStatistics({
          accepted: data.accepted || 0,
          declined: data.declined || 0,
          total: data.total || 0,
        });
      })
      .catch((error) => console.error("Error fetching user statistics:", error));
  }, []);

  const chartData = {
    labels: ['Total', 'Accepted', 'Declined'],
    datasets: [
      {
        label: 'Users',
        data: [statistics.total, statistics.accepted, statistics.declined],
        backgroundColor: ['#c13e90', '#22dd58', '#e48d8e'],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  const usersData = [
    { type: 'Total Registration', count: statistics.total },
    { type: 'Accepted Registration', count: statistics.accepted },
    { type: 'Declined Registration', count: statistics.declined },
  ];

  return (
    <div id='reportPage'>
        
    <div id="reportsTable" ref={pdfRef} >
    <DataTable value={values} scrollable scrollHeight="28vw" header={header} emptyMessage="No data found."
        className="custom-data-table" selectionMode="single">
        <Column field="fileType" header="Printed Document Type"></Column>
        <Column field="number" header="Total Number of Requests"></Column>
        <Column field="copies" header="Total Number of Copies"></Column>
    </DataTable>


    <div className="reports-container">

      <div className="chart-section">
        <Bar data={chartData} options={chartOptions} />
      </div>

      <div className="table-section">
        <DataTable value={usersData} className="p-datatable-striped">
          <Column field="type" header="Number of Users"></Column>
          <Column field="count" header="Count"></Column>
        </DataTable>
      </div>
    </div>
    </div>
    <button id="dlButton" onClick={downloadReport}>Download Report</button>
    </div>
    
  );
};

export default Reports;
