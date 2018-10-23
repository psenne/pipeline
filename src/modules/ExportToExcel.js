import XLSX from "xlsx";
import { saveAs } from "file-saver";
import moment from "moment";

// some random function for excel exporting
function s2ab(s) {
    var buf = new ArrayBuffer(s.length);
    var view = new Uint8Array(buf);
    for (var i = 0; i !== s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
    return buf;
}

export default function(candidateList) {
    // map candidates array for excel formatting
    const jsontable = candidateList
        .filter(item => {
            return item.info.archived === "current";
        })
        .map(item => {
            const potential_contracts = item.info.potential_contracts ? item.info.potential_contracts.join(", ") : "";
            const interview_date = item.info.interview_date ? moment(item.info.interview_date).format("MMM, DD YYYY") : "";
            const interviewers = item.info.interviewed_by ? " (" + item.info.interviewed_by.join(", ") + ")" : "";
            const resume_type = item.info.resume_type ? item.info.resume_type.join(", ") : "";
            const loi_sent = item.info.loi_sent_by && item.info.loi_sent_date ? " (sent by " + item.info.loi_sent_by + " on " + moment(item.info.loi_sent_date).format("MMM, DD YYYY") + ")" : "";
            const salary = atob(item.info.salary);

            return {
                Name: item.info.firstname + " " + item.info.lastname,
                "Current Contract": item.info.current_contract,
                "Potential Contracts": potential_contracts,
                Skill: item.info.skill,
                Level: item.info.level,
                "Interview Date": interview_date + interviewers,
                "LOI Status": item.info.loi_status + loi_sent,
                Resume: resume_type,
                "Found By": item.info.found_by,
                Salary: salary,
                Notes: item.info.notes,
                "Next Steps": item.info.next_steps
            };
        });

    var worksheet = XLSX.utils.json_to_sheet(jsontable);
    var workbook = XLSX.utils.book_new();
    var wopts = { bookType: "xlsx", bookSST: false, type: "binary" };

    //worksheet["A1"].s = { font: {sz: 14, bold: true, color: "#FF00FF" }}
    worksheet["!autofilter"] = { ref: worksheet["!ref"] };
    worksheet["!cols"] = [{ width: 18 }, { width: 15 }, { width: 20 }, { width: 23 }, { width: 11 }, { width: 22 }, { width: 34 }, { width: 25 }, { width: 20 }, { width: 8 }, { width: 50 }, { width: 50 }];

    XLSX.utils.book_append_sheet(workbook, worksheet, "Current Candidates");
    var wbout = XLSX.write(workbook, wopts);

    const today = moment()
        .format("DD.MMM.YYYY")
        .toUpperCase();
    saveAs(new Blob([s2ab(wbout)], { type: "application/octet-stream" }), "pipeline." + today + ".xlsx");
}
