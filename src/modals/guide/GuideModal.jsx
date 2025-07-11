import React from "react";
import "../../CommonStyles.css";
import Explanation from "../../components/typography/Explanation";
import Strong from "../../components/typography/Strong";
import Table from "../../components/typography/Table";
import TableRow from "../../components/typography/TableRow";
import TableHeading from "../../components/typography/TableHeading";
import TableColumn from "../../components/typography/TableColumn";

export const GuideModal = ({dialog}) => {

    return (
        <div style={{width: "600px", height: "800px", overflowY: 'scroll'}}>
            <div style={{width: '90%', margin: 'auto'}}>
                <div style={{display: "flex", flexDirection: "column", alignItems: "center"}}>
                    <sp-heading style={{marginTop: 0}} size={'L'}>Simple guide for Template making</sp-heading>
                    <sp-divider style={{backgroundColor: 'white', marginTop: '5px', marginBottom: '10px'}}></sp-divider>
                    <sp-body>
                        Templates are text, which contain special "text" that allows you to have different results based on specific files.<br/>
                        <br/>
                        This means that you don't have to name each file separately if you want to stay organized. Instead, you can make one template, and it will
                        automatically create a name for each file based on it's characteristics. One such example could be page numbers. Page numbers are different
                        from file to file. Normally you would have to write each page number for each file. With templates, you write it ONCE!!!<br/>
                        <br/>
                        <Strong>Interested? Well, here is a guide on how to.</Strong>
                    </sp-body>
                    <sp-heading size={'M'}>Explanation</sp-heading>
                    <sp-body>
                        Unlike normal naming, templates use <Strong>Variables.</Strong> Variables are special text, which changes from file to file. They are surrounded
                        by % symbols. These variables are replaced by another piece of text when they are used later. An example of template with variables is provided
                        below:
                        <Explanation>Sword_demon_p%a3% => Sword_demon_p001</Explanation>
                        In this case, we are using the <Strong>Leading zeros page number.</Strong>It means that it will add zeros to the beginning of the page number,
                        until the length of the page number is equal to the number 3 in this case. There are multiple different variables you can use. We will discuss
                        them in the next section.
                    </sp-body>
                    <sp-heading size={'M'}>Documentation</sp-heading>
                    <br/>
                    <Table>
                        <TableRow>
                            <TableHeading>Command</TableHeading>
                            <TableHeading>Usage</TableHeading>
                            <TableHeading>Explanation</TableHeading>
                        </TableRow>
                        <TableRow>
                            <TableColumn>og</TableColumn>
                            <TableColumn>%og%</TableColumn>
                            <TableColumn>Original file name</TableColumn>
                        </TableRow>
                    </Table>
                    <div class={"table-style"}>
                        <div class={"row-header-style"}>
                            <sp-heading size={"XS"} class={"col-style text-center col-right-border width-50"}>Command</sp-heading>
                            <sp-heading size={"XS"} class={"col-style text-center width-50"}>Explanation</sp-heading>
                        </div>
                        <div class={"row-style"}>
                            <sp-body class={"col-style col-right-border width-50"}>og</sp-body>
                            <sp-body class={"col-style width-50 left-pad"}>Takes the original file name</sp-body>
                        </div>
                        <div class={"row-style"}>
                            <sp-body class={"col-style col-right-border width-50"}>num</sp-body>
                            <sp-body class={"col-style width-50 left-pad"}>Writes the page number (Page numbers start at 1 from the first file in the folder. You can
                                adjust this in the movement tab though.</sp-body>
                        </div>
                        <div className={"row-style"}>
                            <sp-body class={"col-style col-right-border width-50"}>an</sp-body>
                            <sp-body class={"col-style width-50 left-pad"}>Writes the page number with leading zeros (replace the character n with the number of
                                leading zeros you want in the page number. Example. a3 will give 001 for page number 1)
                            </sp-body>
                        </div>
                    </div>
                </div>
            </div>
            <br/>
            <div class={"right-div-align"}>
                <sp-action-button onClick={() => dialog.close()}>Close</sp-action-button>
            </div>
        </div>
    )
}